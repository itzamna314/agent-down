package dal

import (
	"database/sql"
	"errors"
	_ "github.com/go-sql-driver/mysql"
)

func CreateGame(db *sql.DB, g *Game) (*Game, error) {
	result, err := db.Exec(
		"INSERT INTO game(state, createdBy) VALUES (?, ?)",
		g.State,
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
	row := db.QueryRow(`SELECT g.id
		                     , g.locationId
		                     , g.state
		                     , g.secondsRemaining
		                     , g.latitude
		                     , g.longitude
		                     , cr.id as creatorId
		                     , spy.id as spyId
		                     , accused.Id as accusedId
		                     , accuser.Id as accuserId
		                  FROM game g 
		             LEFT JOIN player cr on cr.gameId = g.id and cr.isCreator = 1
		             LEFT JOIN player spy on spy.gameId = g.id and spy.isSpy = 1
		             LEFT JOIN accusation acc on acc.gameId = g.id and acc.state = 'voting'
		             LEFT JOIN player accused on accused.id = acc.accusedId
		             LEFT JOIN player accuser on accuser.id = acc.accuserId
		                 WHERE g.id = ?`,
		id)
	err := row.Scan(g.id, g.locationId, g.state, g.secondsRemaining, g.latitude, g.longitude, g.creatorId, g.spyId, g.accusedId, g.accuserId)
	if err != nil {
		return nil, err
	}

	players, err := FindGamePlayers(db, id)
	if err != nil {
		return nil, err
	}

	g.playerIds = players

	return g.ToGame(), nil
}

// TODO: Make the second param a map if useful
func FindGames(db *sql.DB, state string) ([]*Game, error) {
	if len(state) == 0 {
		return FindAllGames(db)
	}

	rows, err := db.Query(`SELECT g.id
		                        , g.locationId
		                        , g.state
		                        , g.secondsRemaining
		                        , g.latitude
		                        , g.longitude
		                        , cr.id as creatorId
		                     FROM game g
		                     JOIN player cr on cr.gameId = g.id
		                    WHERE g.state = ?`,
		state)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	games := make([]*Game, 0)

	for rows.Next() {
		g := newGameDto()

		err := rows.Scan(g.id, g.locationId, g.state, g.secondsRemaining, g.latitude, g.longitude, g.creatorId)
		if err != nil {
			return nil, err
		}

		games = append(games, g.ToGame())
	}

	return games, nil
}

func FindAllGames(db *sql.DB) ([]*Game, error) {
	rows, err := db.Query(`SELECT g.id
		                        , g.locationId
		                        , g.state
		                        , g.secondsRemaining
		                        , g.latitude
		                        , g.longitude
		                        , cr.id as creatorId
		                     FROM game g
		                     JOIN player cr on cr.gameId = g.id
		                    WHERE g.state = ?`)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var games []*Game

	for rows.Next() {
		g := newGameDto()
		err := rows.Scan(g.id, g.locationId, g.state, g.secondsRemaining, g.latitude, g.longitude, g.creatorId)
		if err != nil {
			return nil, err
		}

		games = append(games, g.ToGame())
	}

	return games, nil
}

func ReplaceGame(db *sql.DB, id int64, g *Game) (*Game, error) {
	res, err := db.Exec(`UPDATE game 
	  	                    SET locationId = ?
		                      , state = ?
		                      , secondsRemaining = ?
		                      , latitude = ?
		                      , longitude = ?
		                      , modifiedOn = CURRENT_TIMESTAMP
		                      , modifiedBy = ?
		                  WHERE id = ?`,
		g.LocationId, g.State, g.SecondsRemaining, g.Latitude, g.Longitude, "dal:ReplaceGame()", id)

	if err != nil {
		return nil, err
	}

	if num, _ := res.RowsAffected(); num == 0 {
		return nil, errors.New("Game not found")
	}

	return FetchGame(db, id)
}

func RemoveGame(db *sql.DB, id int64) error {
	_, err := db.Exec(`UPDATE player
		                 SET gameId = null
		               WHERE gameId = ?`,
		id)

	if err != nil {
		return err
	}

	_, err = db.Exec(`DELETE FROM game
		                    WHERE id = ?`,
		id)

	return err
}
