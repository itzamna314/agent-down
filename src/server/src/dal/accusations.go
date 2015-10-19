package dal

import (
	"database/sql"
	"errors"
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
		log.Printf("Failed to open transaction")
		return nil, err
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
			          	       , ?
			          	    FROM game
			          	   WHERE id = ?
			           `,
		a.AccuserId,
		a.AccusedId,
		a.GameId,
		"dal:CreateAccusation()",
		a.GameId,
	)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()

	if err != nil {
		return nil, err
	}

	vote := Vote{
		PlayerId:     a.AccuserId,
		AccusationId: &id,
		Accuse:       new(bool),
	}

	*vote.Accuse = true

	_, err = CreateVote(db, &vote, tx)

	if err != nil {
		return nil, err
	}

	tx.Commit()

	return FetchAccusation(db, id)
}

func CheckAccusationState(db *sql.DB, id int) (string, error) {
	row := db.QueryRow(
		`SELECT COUNT(p.id) AS numPlayers
              , COALESCE(SUM(CASE WHEN pa.id IS NOT NULL THEN 1 ELSE 0 END),0) AS numVotes
              , COALESCE(SUM(CASE WHEN pa.accuse ))
              , COALESCE(SUM(pa.accuse), 0)
           FROM player p 
           JOIN game g ON g.id = p.gameId
           JOIN accusation a ON a.gameId = g.id
      LEFT JOIN playerAccusation pa ON pa.playerId = p.id
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

		_, err := db.Exec(
			`UPDATE a
			    SET a.state = ?
			      , a.modifiedOn=CURRENT_TIMESTAMP
			      , a.modifiedBy='dal:CheckAccusationState()'`,
			state)

		if err != nil {
			return "", err
		}

		return state, nil
	}

	return "voting", nil
}
