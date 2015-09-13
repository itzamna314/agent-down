package dal

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

func CreateGame(db *sql.DB) (*Game, error) {
	result, err := db.Exec(
		"INSERT INTO game(createdBy) VALUES (?)",
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
	g := newGameDto()
	row := db.QueryRow("SELECT id, locationId, state, secondsRemaining, latitude, longitude  FROM game WHERE id = ?", id)
	err := row.Scan(g.id, g.locationId, g.state, g.secondsRemaining, g.latitude, g.longitude)
	if err != nil {
		return nil, err
	}

	return g.ToGame(), nil
}

// TODO: Make the second param a map if useful
func FindGames(db *sql.DB, state string) ([]*Game, error) {
	if len(state) == 0 {
		return FindAllGames(db)
	}

	rows, err := db.Query("SELECT id, locationId, state, secondsRemaining, latitude, longitude FROM game WHERE state = ?", state)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	games := make([]*Game, 0)

	for rows.Next() {
		g := newGameDto()

		err := rows.Scan(g.id, g.locationId, g.state, g.secondsRemaining, g.latitude, g.longitude)
		if err != nil {
			return nil, err
		}

		games = append(games, g.ToGame())
	}

	return games, nil
}

func FindAllGames(db *sql.DB) ([]*Game, error) {
	rows, err := db.Query("SELECT id, locationId, state, secondsRemaining, latitude, longitude FROM game")
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var games []*Game

	for rows.Next() {
		g := newGameDto()
		err := rows.Scan(g.id, g.locationId, g.state, g.secondsRemaining, g.latitude, g.longitude)
		if err != nil {
			return nil, err
		}

		games = append(games, g.ToGame())
	}

	return games, nil
}

func ReplaceGame(db *sql.DB, id int64, g *Game) (*Game, error) {
	_, err := db.Exec(`UPDATE game 
	  	                  SET locationId = ?
		                    , state = ?
		                    , creatorId = ?
		                    , spyId = ?
		                    , accusedId = ?
		                    , accuserId = ?
		                    , secondsRemaining = ?
		                    , latitude = ?
		                    , longitude = ?
		                    , modifiedOn = CURRENT_TIMESTAMP
		                    , modifiedBy = ?
		                WHERE id = ?`,
		g.LocationId, g.State, g.Creator, g.Spy, g.Accused, g.Accuser, g.SecondsRemaining, g.Latitude, g.Longitude, "dal:ReplaceGame()", id)

	if err != nil {
		return nil, err
	}

	return FetchGame(db, id)

}
