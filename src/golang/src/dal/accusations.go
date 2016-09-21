package dal

import (
	"database/sql"
	"errors"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"log"
)

func FetchAccusation(db *sql.DB, id int64) (*Accusation, error) {
	row := db.QueryRow(`SELECT a.id
		                     , a.accuserId
		                     , a.accusedId
		                     , a.gameId
		                     , a.time
		                     , ast.name as state
							 , gst.name as gameState
		                  FROM accusation a
						  JOIN accusationStateType ast on ast.id = a.stateId
						  JOIN gameStateType gst on gst.id = a.gameStateId
		                 WHERE a.id = ?`,
		id)

	dto := newAccusationDto()
	err := row.Scan(dto.id, dto.accuserId, dto.accusedId, dto.gameId, dto.time, dto.state, dto.gameState)

	if err != nil {
		return nil, err
	}

	voteIds, err := FindAccusationVotes(db, id)

	if err != nil {
		return nil, err
	}

	dto.voteIds = voteIds

	return dto.ToAccusation(), nil
}

func FindGameAccusations(db *sql.DB, gameId int64) ([]int64, error) {
	rows, err := db.Query("SELECT a.id FROM accusation a WHERE a.gameId=?", gameId)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var ids []int64

	for rows.Next() {
		id := new(int64)
		err := rows.Scan(id)
		if err != nil {
			return nil, err
		}

		ids = append(ids, *id)
	}

	return ids, nil
}

func FindPlayerAccusationsMade(db *sql.DB, playerId int64) ([]int64, error) {
	rows, err := db.Query("SELECT a.id FROM accusation a WHERE a.accuserId=?", playerId)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var ids []int64

	for rows.Next() {
		id := new(int64)
		err := rows.Scan(id)
		if err != nil {
			return nil, err
		}

		ids = append(ids, *id)
	}

	return ids, nil
}

func FindPlayerAccusationsAgainst(db *sql.DB, playerId int64) ([]int64, error) {
	rows, err := db.Query("SELECT a.id FROM accusation a WHERE a.accusedId=?", playerId)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var ids []int64

	for rows.Next() {
		id := new(int64)
		err := rows.Scan(id)
		if err != nil {
			return nil, err
		}

		ids = append(ids, *id)
	}

	return ids, nil
}

func CreateAccusation(db *sql.DB, a *Accusation) (*Accusation, error) {
	if a.AccusedId == nil || a.AccuserId == nil || a.GameId == nil {
		return nil, errors.New("Accuser, Accused, and Game are required")
	}

	tx, err := db.Begin()

	if err != nil {
		return nil, errors.New("Failed to begin transaction")
	}

	stateRow := tx.QueryRow(
		`SELECT gst.name as gameState
		   FROM game g
		   JOIN gameStateType gst on gst.id = g.stateId 
		  WHERE g.id=?`,
		a.GameId)

	var gameState string
	if err := stateRow.Scan(&gameState); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("Illegal game state: %s\n", err)
	}

	accusationGameState := GameState(gameState)

	if accusationGameState != GS_InProgress && accusationGameState != GS_FinalReckoning {
		tx.Rollback()
		return nil, fmt.Errorf("Illegal game state: %s\n", gameState)
	}

	log.Printf("Accusation game state: %s\n", accusationGameState)

	previousAccusationRow := tx.QueryRow(
		`SELECT id
		   FROM accusation a
		  WHERE a.accuserId = ?
		    AND a.gameId = ?
			AND a.gameStateId = ?`,
		a.AccuserId,
		a.GameId,
		gameStateId[accusationGameState])

	err = previousAccusationRow.Scan()

	if err != sql.ErrNoRows {
		tx.Rollback()
		return nil, fmt.Errorf("Duplicate accusation")
	}

	stateResult, err := tx.Exec(
		`UPDATE game
		    SET stateId=?
		      , modifiedOn = CURRENT_TIMESTAMP
		      , modifiedBy = 'dal:CreateAccusation()'
		  WHERE id=?`,
		gameStateId[GS_Voting], a.GameId)

	if ra, _ := stateResult.RowsAffected(); err != nil || ra != 1 {
		tx.Rollback()
		return nil, fmt.Errorf("Failed to set game state: %n", err)
	}

	result, err := tx.Exec(
		`INSERT INTO accusation( time
			                   , accuserId
			                   , accusedId
			                   , gameId
							   , gameStateId
			                   , createdBy
			                   ) 
	                      SELECT TIMESTAMPDIFF(SECOND, clockStartTime, CURRENT_TIMESTAMP)
			                   , ?
							   , ?
			          	       , ?
			          	       , ?
			          	       , 'dal:CreateAccusation()'
			          	    FROM game
			          	   WHERE id = ?
			           `,
		a.AccuserId,
		a.AccusedId,
		a.GameId,
		gameStateId[accusationGameState],
		a.GameId,
	)

	if err != nil {
		log.Printf("Failed to create accusation for game %d\n", a.GameId)
		return nil, err
	}

	id, err := result.LastInsertId()

	if err != nil {
		log.Printf("Failed to get last inserted id from accusation\n")
		return nil, err
	}

	tx.Commit()

	StopGameClock(db, *a.GameId)

	return FetchAccusation(db, id)
}

func UpdateAccusationState(db *sql.DB, id int) (*AccusationState, error) {
	var tx, err = db.Begin()

	if err != nil {
		return nil, err
	}

	row := tx.QueryRow(
		`SELECT COUNT(p.id) AS numPlayers
              , COALESCE(SUM(CASE WHEN pa.id IS NOT NULL THEN 1 ELSE 0 END),0) AS numVotes
              , COALESCE(SUM(pa.accuse)) AS numGuilty
           FROM player p 
           JOIN game g ON g.id = p.gameId
           JOIN accusation a ON a.gameId = g.id
      LEFT JOIN playerAccusation pa ON pa.playerId = p.id AND pa.accusationId = a.id
          WHERE a.id=?`, id)

	numPlayers, numVotes, numGuilty := new(int), new(int), new(int)

	err = row.Scan(numPlayers, numVotes, numGuilty)

	if err != nil {
		return nil, err
	}

	var state AccusationState

	if *numVotes >= *numPlayers-1 {
		guilty := *numGuilty == *numVotes

		if guilty {
			state = AS_Guilty
		} else {
			state = AS_Innocent
		}

		_, err := tx.Exec(
			`UPDATE accusation
			    SET stateId = ?
			      , modifiedOn=CURRENT_TIMESTAMP
			      , modifiedBy='dal:UpdateAccusationState()'
			  WHERE id=?`,
			accusationStateId[state],
			id)

		if err != nil {
			tx.Rollback()
			return nil, err
		}

		row = tx.QueryRow(
			`SELECT a.gameId
		          , gst.name as gameState
		       FROM accusation a
		       JOIN gameStateType gst on gst.id = a.gameStateId
		      WHERE a.id=?`, id)

		gameId := new(int)
		gameState := new(string)

		err = row.Scan(gameId, gameState)

		if err != nil {
			return nil, err
		}

		_, err = tx.Query(
			`UPDATE game g
			    SET g.stateId = ? 
			      , g.modifiedOn = CURRENT_TIMESTAMP
			      , g.modifiedBy = 'dal:UpdateAccusationState()'
			  WHERE g.id=?`,
			gameStateId[GameState(*gameState)],
			gameId)

		if err != nil {
			tx.Rollback()
			return nil, err
		}

		tx.Commit()

		if GameState(*gameState) == GS_InProgress && state == AS_Innocent {
			StartGameClock(db, int64(*gameId))
		}

		if GameState(*gameState) == GS_FinalReckoning && state == AS_Innocent {
			row = db.QueryRow(
				`SELECT COUNT(a.id) as numAccused
				   FROM accusation a
				   JOIN game g on g.id = a.gameId
				  WHERE g.id = ?`,
				gameId)

			var numAccused int
			err = row.Scan(&numAccused)

			if err != nil {
				return nil, err
			}

			if numAccused == *numPlayers {
				_, err := db.Exec(`UPDATE game g
				                      SET g.stateId = ?
				                        , g.victoryType = ?
				                        , g.modifiedOn = CURRENT_TIMESTAMP
				                        , g.modifiedBy = 'dal:UpdateAccusationState().byDefault'
			                        WHERE g.id = ?`,
					gameStateId[GS_SpyWins],
					victoryTypeId[VT_Default],
					gameId)

				if err != nil {
					return nil, err
				}

			}
		}

		return &state, nil
	}

	state = AS_Voting

	return &state, nil
}
