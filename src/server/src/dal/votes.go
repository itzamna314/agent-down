package dal

import (
	"database/sql"
	"errors"
	_ "github.com/go-sql-driver/mysql"
)

func FetchVote(db *sql.DB, id int64) (*Vote, error) {
	row := db.QueryRow(`SELECT pa.id
		                     , pa.playerId
		                     , pa.accusationId
		                     , pa.accuse
		                  FROM playerAccusation pa
		                 WHERE pa.id = ?`,
		id)

	dto := newPlayerAccusationDto()
	err := row.Scan(dto.id, dto.playerId, dto.accusationId, dto.accuse)

	if err != nil {
		return nil, err
	}

	return dto.ToVote(), nil
}

func CreateVote(db *sql.DB, v *Vote) (*Vote, error) {
	if v.AccusationId == nil || v.PlayerId == nil || v.Accuse == nil {
		return nil, errors.New("Player, Accusation, and Accuse are required")
	}

	result, err := db.Exec(
		"INSERT INTO playerAccusation(playerId, accusationId, accuse, createdBy) VALUES (?, ?, ?, ?)",
		v.PlayerId,
		v.AccusationId,
		v.Accuse,
		"dal:CreateVote()",
	)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()

	if err != nil {
		return nil, err
	}

	return FetchVote(db, id)
}
