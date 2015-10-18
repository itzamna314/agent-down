package dal

import (
	"database/sql"
	"errors"
	_ "github.com/go-sql-driver/mysql"
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

	row = db.QueryRow(`SELECT COALESCE(SUM(CASE WHEN accuse=true THEN 1 ELSE 0 END), 0) AS votesFor
		                    , COALESCE(SUM(CASE WHEN accuse=false THEN 0 ELSE 1 END), 0) AS votesAgainst
		                 FROM playerAccusation
		                WHERE accusationId = ?`,
		id)

	err = row.Scan(dto.votesFor, dto.votesAgainst)

	if err != nil {
		return nil, err
	}

	return dto.ToAccusation(), nil
}

func CreateAccusation(db *sql.DB, a *Accusation) (*Accusation, error) {
	if a.AccusedId == nil || a.AccuserId == nil || a.GameId == nil {
		return nil, errors.New("Accuser, Accused, and Game are required")
	}

	result, err := db.Exec(
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

	_, err = db.Exec(
		`UPDATE player
		   SET hasAccused = true
		 WHERE id = ?`,
		a.AccuserId,
	)

	if err != nil {
		return nil, err
	}

	return FetchAccusation(db, id)
}
