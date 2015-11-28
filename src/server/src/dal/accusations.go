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
		                     , a.state
		                  FROM accusation a
		                 WHERE a.id = ?`,
		id)

	dto := newAccusationDto()
	err := row.Scan(dto.id, dto.accuserId, dto.accusedId, dto.gameId, dto.time, dto.state)

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

func CreateAccusation(db *sql.DB, a *Accusation) (*Accusation, error) {
	if a.AccusedId == nil || a.AccuserId == nil || a.GameId == nil {
		return nil, errors.New("Accuser, Accused, and Game are required")
	}

	tx, err := db.Begin()

	if err != nil {
		return nil, errors.New("Failed to begin transaction")
	}

	stateRow := tx.QueryRow(
		`SELECT state
		   FROM game
		  WHERE id=?`,
		a.GameId)

	var state string
	if err := stateRow.Scan(&state); err != nil || state != "inProgress" {
		tx.Rollback()
		return nil, fmt.Errorf("Illegal game state %s: %s\n", state, err)
	}

	stateResult, err := tx.Exec(
		`UPDATE game
		    SET state='accusing'
		      , modifiedOn = CURRENT_TIMESTAMP
		      , modifiedBy = 'dal:CreateAccusation()'
		  WHERE id=?`,
		a.GameId)

	if ra, _ := stateResult.RowsAffected(); err != nil || ra != 1 {
		tx.Rollback()
		return nil, fmt.Errorf("Failed to set game state: %n", err)
	}

	result, err := tx.Exec(
		`INSERT INTO accusation( time
			                   , accuserId
			                   , accusedId
			                   , gameId
			                   , createdBy
			                   ) 
	                      SELECT TIMESTAMPDIFF(SECOND, clockStartTime, CURRENT_TIMESTAMP)
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

func UpdateAccusationState(db *sql.DB, id int) (string, error) {
	row := db.QueryRow(
		`SELECT COUNT(p.id) AS numPlayers
              , COALESCE(SUM(CASE WHEN pa.id IS NOT NULL THEN 1 ELSE 0 END),0) AS numVotes
              , COALESCE(SUM(pa.accuse)) AS numGuilty
           FROM player p 
           JOIN game g ON g.id = p.gameId
           JOIN accusation a ON a.gameId = g.id
      LEFT JOIN playerAccusation pa ON pa.playerId = p.id AND pa.accusationId = a.id
          WHERE a.id=?`, id)

	numPlayers, numVotes, numGuilty := new(int), new(int), new(int)

	err := row.Scan(numPlayers, numVotes, numGuilty)

	if err != nil {
		return "", err
	}

	if *numVotes >= *numPlayers-1 {
		guilty := *numGuilty == *numVotes

		var state string

		if guilty {
			state = "guilty"
		} else {
			state = "innocent"
		}

		log.Printf("Accusation resolved as %s\n", state)

		_, err := db.Exec(
			`UPDATE accusation
			    SET state = ?
			      , modifiedOn=CURRENT_TIMESTAMP
			      , modifiedBy='dal:UpdateAccusationState()'
			  WHERE id=?`,
			state,
			id)

		_, err = db.Query(
			`UPDATE game g
			   JOIN accusation a on a.gameId = g.id
			    SET g.state = 'inProgress'
			      , g.modifiedOn = CURRENT_TIMESTAMP
			      , g.modifiedBy = 'dal:UpdateAccusationState()'
			  WHERE a.id=?`,
			id)

		gameRows, err := db.Query(`SELECT g.id as gameId
			    FROM game g
			    JOIN accusation a on a.gameId = g.id
			   WHERE a.id=?`,
			id)

		if err != nil {
			return "", err
		}

		defer gameRows.Close()

		if state == "innocent" {
			var gameId int64
			if !gameRows.Next() {
				return "", err
			}
			if err := gameRows.Scan(&gameId); err == nil {
				StartGameClock(db, gameId)
			}
		}

		return state, nil
	}

	return "voting", nil
}
