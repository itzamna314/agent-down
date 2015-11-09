package dal

import (
	"database/sql"
	"errors"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"time"
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
		                     , g.victoryType
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
	err := row.Scan(g.id, g.locationId, g.state, g.victoryType, g.latitude, g.longitude, g.creatorId, g.spyId, g.accusedId, g.accuserId)
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

		err := rows.Scan(g.id, g.locationId, g.state, g.latitude, g.longitude, g.creatorId)
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
		err := rows.Scan(g.id, g.locationId, g.state, g.latitude, g.longitude, g.creatorId)
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
		                      , latitude = ?
		                      , longitude = ?
		                      , modifiedOn = CURRENT_TIMESTAMP
		                      , modifiedBy = ?
		                  WHERE id = ?`,
		g.LocationId, g.State, g.Latitude, g.Longitude, "dal:ReplaceGame()", id)

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

func IsRealSpy(db *sql.DB, accusationId int64) (bool, error) {
	row := db.QueryRow(`SELECT a.accusedId
		                          , p.id as spyId
	                           FROM accusation a 
                               JOIN game g ON g.id = a.gameId
                               JOIN player p ON p.gameId = g.id
		                      WHERE a.id=?
                                AND p.isSpy = 1`,
		accusationId)

	accusedId, spyId := new(int), new(int)

	err := row.Scan(accusedId, spyId)

	if err != nil {
		return false, err
	}

	return *accusedId == *spyId, nil
}

func Victory(db *sql.DB, accusationId int64, victoryType string, spyWins bool) error {
	var state string

	if spyWins {
		state = "spyWins"
	} else {
		state = "playersWin"
	}

	_, err := db.Exec(`UPDATE game g
		                 JOIN accusation a on a.gameId = g.id
		                  SET g.state=?
		                    , g.victoryType=?
		                    , g.modifiedOn=CURRENT_TIMESTAMP
		                    , g.modifiedBy='dal:Victory()'
		                WHERE a.id=?`,
		state, victoryType, accusationId)

	return err
}

func GetGameClock(db *sql.DB, gameId int64) (*GameClock, error) {
	g := newGameClockDto()
	row := db.QueryRow(`SELECT g.id
		                     , g.secondsRemaining
		                     , g.clockStartTime 
		                     , g.clockIsRunning as isRunning
		                  FROM game g
		                 WHERE g.id = ?`,
		gameId)

	if err := row.Scan(g.id, g.secondsRemaining, g.clockStartTime, g.isRunning); err != nil {
		return nil, err
	}

	isRunning := BoolOrNull(g.isRunning)

	// If the clock isn't running, secondsRemaining MUST be accurate
	if isRunning == nil || !*isRunning || !g.secondsRemaining.Valid || !g.clockStartTime.Valid {
		return &GameClock{
			GameId:           g.id,
			SecondsRemaining: IntOrNull(g.secondsRemaining),
			IsRunning:        isRunning,
		}, nil
	}

	var nowTicks sql.NullString
	row = db.QueryRow(`SELECT CURRENT_TIMESTAMP as nowTicks`)

	if err := row.Scan(&nowTicks); err != nil || !nowTicks.Valid {
		return nil, err
	}

	s := g.secondsRemaining.Int64

	now, _ := time.Parse(dbDateLayout, nowTicks.String)
	startTime, _ := time.Parse(dbDateLayout, g.clockStartTime.String)

	remaining := s - int64(now.Sub(startTime).Seconds())

	return &GameClock{
		GameId:           g.id,
		SecondsRemaining: &remaining,
		IsRunning:        isRunning,
	}, nil
}

func StartGameClock(db *sql.DB, gameId int64) error {
	log.Printf("Starting game clock\n")

	_, err := db.Exec(`UPDATE game
		               SET clockStartTime = CURRENT_TIMESTAMP
		                 , clockIsRunning = true
		                 , modifiedOn = CURRENT_TIMESTAMP
		                 , modifiedBy = 'dal:StartGameClock()'
		             WHERE id = ?`,
		gameId)

	if err != nil {
		return err
	}

	clock, err := GetGameClock(db, gameId)

	if err != nil {
		return err
	}

	publishClockEvent(clock)

	return nil
}

func StopGameClock(db *sql.DB, gameId int64) error {
	_, err := db.Exec(`UPDATE game
		               SET secondsRemaining = TIMESTAMPDIFF(SECOND, clockStartTime, CURRENT_TIMESTAMP)
		                 , clockIsRunning = false
		                 , modifiedOn = CURRENT_TIMESTAMP
		                 , modifiedBy = 'dal:StopGameClock()'
		             WHERE id = ?`,
		gameId)

	if err != nil {
		return err
	}

	clock, err := GetGameClock(db, gameId)

	if err != nil {
		return err
	}

	publishClockEvent(clock)

	return nil
}

// Allows us to publish clock events to a single subscriber
var GameClockEvents chan *GameClock = make(chan *GameClock)

func publishClockEvent(evt *GameClock) {
	log.Printf("Publishing clock event: %v\n", evt)
	select {
	case GameClockEvents <- evt:
	default:
	}
}
