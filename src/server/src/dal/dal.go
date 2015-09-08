package dal

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

func Open() (db *sql.DB, err error) {
	db, err = sql.Open("mysql", "tcp(127.0.0.1:3306)/test")
	return
}

type Game struct {
	id               *int
	locationId       *int
	state            *string
	secondsRemaining *int
	latitude         *float64
	longitude        *float64
	createdOn        *string
	createdBy        *string
	modifiedOn       *string
	modifiedBy       *string
}

func CreateGame(db *sql.DB) (*Game, error) {
	result, err := db.Exec(
		"INSERT INTO game(createdBy) VALUES ($1)",
		"dal:CreateGame()",
	)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()

	if err != nil {
		return nil, err
	}

	return FetchGame(db, id)
}

func FetchGame(db *sql.DB, id int64) (*Game, error) {
	var g Game
	row := db.QueryRow("SELECT * FROM game WHERE id = ?", id)
	err := row.Scan(g.id, g.locationId, g.state, g.secondsRemaining, g.latitude, g.longitude, g.createdOn, g.createdBy, g.modifiedOn, g.modifiedBy)
	if err != nil {
		return nil, err
	}

	return &g, nil
}

// TODO: Make the second param a map if useful
func FindGames(db *sql.DB, state string) ([]*Game, error) {
	rows, err := db.Query("SELECT * FROM game WHERE state = ?", state)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	games := make([]*Game, 0)

	for rows.Next() {
		var g Game
		err := rows.Scan(g.id, g.locationId, g.state, g.secondsRemaining, g.latitude, g.longitude, g.createdOn, g.createdBy, g.modifiedOn, g.modifiedBy)
		if err != nil {
			return nil, err
		}

		games = append(games, &g)
	}

	return games, nil
}

func FindAllGames(db *sql.DB) ([]*Game, error) {
	rows, err := db.Query("SELECT * FROM game")
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var games []*Game

	for rows.Next() {
		var g Game
		err := rows.Scan(g.id, g.locationId, g.state, g.secondsRemaining, g.latitude, g.longitude, g.createdOn, g.createdBy, g.modifiedOn, g.modifiedBy)
		if err != nil {
			return nil, err
		}

		games = append(games, &g)
	}

	return games, nil
}
