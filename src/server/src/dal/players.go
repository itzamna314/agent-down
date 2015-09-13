package dal

import (
	"database/sql"
	"errors"
	_ "github.com/go-sql-driver/mysql"
)

func FindAllPlayers(db *sql.DB) ([]*Player, error) {
	rows, err := db.Query("SELECT id, name, gameId, isSpy, isBeingAccused, isCreator, hasAccused FROM player")
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var players []*Player

	for rows.Next() {
		dto := newPlayerDto()
		err := rows.Scan(dto.id, dto.name, dto.gameId, dto.isSpy, dto.isBeingAccused, dto.isCreator, dto.hasAccused)
		if err != nil {
			return nil, err
		}

		players = append(players, dto.ToPlayer())
	}

	return players, nil
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
	row := db.QueryRow("SELECT id, name, gameId, isSpy, isBeingAccused, isCreator, hasAccused FROM player WHERE id=?", id)
	dto := newPlayerDto()
	err := row.Scan(dto.id, dto.name, dto.gameId, dto.isSpy, dto.isBeingAccused, dto.isCreator, dto.hasAccused)
	if err != nil {
		return nil, err
	}

	return dto.ToPlayer(), nil
}
