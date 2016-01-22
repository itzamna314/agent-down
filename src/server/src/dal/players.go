package dal

import (
	"database/sql"
	"errors"
	_ "github.com/go-sql-driver/mysql"
)

func FindAllPlayers(db *sql.DB) ([]*Player, error) {
	rows, err := db.Query(`SELECT p.id
		                        , p.name
		                        , p.gameId
		                        , p.isSpy
		                        , p.isCreator
		                     FROM player p`)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var players []*Player

	for rows.Next() {
		dto := newPlayerDto()
		err := rows.Scan(dto.id, dto.name, dto.gameId, dto.isSpy, dto.isCreator)
		if err != nil {
			return nil, err
		}

		players = append(players, dto.ToPlayer())
	}

	return players, nil
}

func FindGamePlayers(db *sql.DB, gameId int64) ([]int64, error) {
	rows, err := db.Query("SELECT p.id FROM player p WHERE p.gameId=?", gameId)
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

func CreatePlayer(db *sql.DB, p *Player) (*Player, error) {
	if len(*p.Name) == 0 {
		return nil, errors.New("Player name is required")
	}

	result, err := db.Exec(
		"INSERT INTO player(name, gameId, isCreator, createdBy) VALUES (?, ?, ?, ?)",
		p.Name,
		p.GameId,
		NullBool(p.IsCreator),
		"dal:CreateGame()",
	)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()

	if err != nil {
		return nil, err
	}

	return FetchPlayer(db, id)
}

func FetchPlayer(db *sql.DB, id int64) (*Player, error) {
	row := db.QueryRow(`SELECT p.id
		                     , p.name
		                     , p.gameId
		                     , p.isSpy
		                     , p.isCreator 
		                  FROM player p
		                 WHERE p.id=?`, id)
	dto := newPlayerDto()
	err := row.Scan(dto.id, dto.name, dto.gameId, dto.isSpy, dto.isCreator)
	if err != nil {
		return nil, err
	}

	accusationsMade, err := FindPlayerAccusationsMade(db, id)
	if err != nil {
		return nil, err
	}

	dto.accusationsMade = accusationsMade

	accusationsAgainst, err := FindPlayerAccusationsAgainst(db, id)
	if err != nil {
		return nil, err
	}

	dto.accusationsAgainst = accusationsAgainst

	votes, err := FindPlayerVotes(db, id)
	if err != nil {
		return nil, err
	}

	dto.votes = votes

	return dto.ToPlayer(), nil
}

func ReplacePlayer(db *sql.DB, id int64, p *Player) (*Player, error) {
	_, err := db.Exec(`UPDATE player 
	  	                  SET name = ?
		                    , gameId = ?
		                    , isSpy = ?
		                    , isCreator = ?
		                    , modifiedOn = CURRENT_TIMESTAMP
		                    , modifiedBy = ?
		                WHERE id = ?`,
		p.Name, p.GameId, p.IsSpy, p.IsCreator, "dal:ReplacePlayer()", id)

	if err != nil {
		return nil, err
	}

	return FetchPlayer(db, id)
}

func RemovePlayer(db *sql.DB, id int64) error {
	_, err := db.Exec(`DELETE FROM player
		                     WHERE id = ?`,
		id)

	return err
}
