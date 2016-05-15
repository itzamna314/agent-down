package dal

import (
	"database/sql"
	"errors"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"time"
	
)

func CreateGame(db *sql.DB, g *Game) (*Game, error) {

	joinCode := GenAlphaNum(5)
	
	
	result, err := db.Exec(
		"INSERT INTO game(joinCode,createdBy) VALUES (?,?)",
		&joinCode,
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
							 , g.locationGuessId
		                     , gst.name as state
		                     , vt.name as victoryType
		                     , g.joinCode
		                     , cr.id as creatorId
		                     , spy.id as spyId
		                  FROM game g 
						  JOIN gameStateType gst on gst.id = g.stateId
				     LEFT JOIN victoryType vt on vt.id = g.victoryTypeId
		             LEFT JOIN player cr on cr.gameId = g.id and cr.isCreator = 1
		             LEFT JOIN player spy on spy.gameId = g.id and spy.isSpy = 1
		                 WHERE g.id = ?`,
		id)
	err := row.Scan(g.id, g.locationId, g.locationGuessId, g.state, g.victoryType, g.joinCode, g.creatorId, g.spyId)
	if err != nil {
		return nil, err
	}

	players, err := FindGamePlayers(db, id)
	if err != nil {
		return nil, err
	}

	g.playerIds = players

	accusations, err := FindGameAccusations(db, id)
	if err != nil {
		return nil, err
	}

	g.accusationIds = accusations

	return g.ToGame(), nil
}

// TODO: Make the second param a map if useful
func FindGames(db *sql.DB, state string) ([]*Game, error) {
	if len(state) == 0 {
		return FindAllGames(db)
	}

	rows, err := db.Query(`SELECT g.id
		                        , g.locationId
		                        , gst.name as state
		                        , cr.id as creatorId
		                     FROM game g
							 JOIN gameStateType gst on gst.id = g.stateId
		                     JOIN player cr on cr.gameId = g.id
		                    WHERE g.stateId = ?
							  AND cr.isCreator = 1
						      AND TIMESTAMPDIFF(HOUR, g.createdOn, CURRENT_TIMESTAMP) < 1`,
		gameStateId[GameState(state)])

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	games := make([]*Game, 0)

	for rows.Next() {
		g := newGameDto()

		err := rows.Scan(g.id, g.locationId, g.state, g.creatorId)
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
		                        , gst.name as state
		                        , cr.id as creatorId
		                     FROM game g
							 JOIN gameStateType gst on gst.id = g.stateId
		                     JOIN player cr on cr.gameId = g.id`)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var games []*Game

	for rows.Next() {
		g := newGameDto()
		err := rows.Scan(g.id, g.locationId, g.state, g.creatorId)
		if err != nil {
			return nil, err
		}

		games = append(games, g.ToGame())
	}

	return games, nil
}

func SetGameState(db *sql.DB, id int64, g *Game) (*Game, error) {
	res, err := db.Exec(`UPDATE game 
	  	                    SET stateId = ?
		                      , modifiedOn = CURRENT_TIMESTAMP
		                      , modifiedBy = ?
		                  WHERE id = ?`,
		gameStateId[GameState(*g.State)], "dal:SetGameState()", id)

	if err != nil {
		return nil, err
	}

	if num, _ := res.RowsAffected(); num == 0 {
		return nil, errors.New("Game not found")
	}

	return FetchGame(db, id)
}

func SetGameLocation(db *sql.DB, id int64, g *Game) (*Game, error) {
	res, err := db.Exec(`UPDATE game 
	  	                    SET locationId = ?
		                      , modifiedOn = CURRENT_TIMESTAMP
		                      , modifiedBy = ?
		                  WHERE id = ?`,
		g.LocationId, "dal:SetGameLocation()", id)

	if err != nil {
		return nil, err
	}

	if num, _ := res.RowsAffected(); num == 0 {
		return nil, errors.New("Game not found")
	}

	return FetchGame(db, id)
}

func SetLocationGuess(db *sql.DB, id int64, g *Game) (*Game, error) {
	log.Printf("Game state: %s\n", *g.State)

	res, err := db.Exec(`UPDATE game 
	  	                    SET locationGuessId = ?
		                      , stateId = ?
							  , victoryTypeId = ?
		                      , modifiedOn = CURRENT_TIMESTAMP
		                      , modifiedBy = ?
		                  WHERE id = ?`,
		g.LocationGuessId, gameStateId[GameState(*g.State)], victoryTypeId[VictoryType(*g.VictoryType)], "dal:SetLocationGuess()", id)

	if err != nil {
		return nil, err
	}

	if num, _ := res.RowsAffected(); num == 0 {
		return nil, errors.New("Game not found")
	}

	return FetchGame(db, id)
}

func RemoveGame(db *sql.DB, id int64) error {
	_, err := db.Exec(`DELETE pa
		                 FROM playerAccusation pa 
		                 JOIN player p on p.id = pa.playerId
		                WHERE p.gameId = ?`,
		id)

	if err != nil {
		return err
	}

	_, err = db.Exec(`DELETE p, a
		                FROM player p
		           LEFT JOIN game g on g.id = p.gameId
		           LEFT JOIN accusation a on a.gameId = g.id
		               WHERE g.id = ?`,
		id)

	if err != nil {
		return err
	}

	_, err = db.Exec(`DELETE g
		                FROM game g
		               WHERE g.id = ?`,
		id)

	if err != nil {
		return err
	}

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

func Victory(db *sql.DB, accusationId int64, victoryType VictoryType, spyWins bool) error {
	var state GameState

	if spyWins {
		state = GS_SpyWins
	} else {
		state = GS_PlayersWin
	}

	log.Printf("Victory type: %s, Game State: %s, spyWins: %v\n", victoryType, state, spyWins)
	log.Printf("victory id: %d, game state id: %d", victoryTypeId[victoryType], gameStateId[state])

	_, err := db.Exec(`UPDATE game g
		                 JOIN accusation a on a.gameId = g.id
		                  SET g.stateId=?
		                    , g.victoryTypeId=?
		                    , g.modifiedOn=CURRENT_TIMESTAMP
		                    , g.modifiedBy='dal:Victory()'
		                WHERE a.id=?`,
		gameStateId[state], victoryTypeId[victoryType], accusationId)

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

	now, err := time.Parse(dbDateLayout, nowTicks.String)

	if err != nil {
		return nil, err
	}

	startTime, err := time.Parse(dbDateLayout, g.clockStartTime.String)

	if err != nil {
		return nil, err
	}

	remaining := s - int64(now.Sub(startTime).Seconds())

	if remaining <= 0 {
		StopGameClock(db, gameId)

		_, err := db.Exec(`UPDATE game
		                      SET stateId = ? 
							    , modifiedOn = CURRENT_TIMESTAMP
								, modifiedBy = 'dal:GetGameClock()
						    WHERE id = ?'`,
			gameStateId[GS_TimeExpired], gameId)

		if err != nil {
			return nil, err
		}

		remaining = 0
		*isRunning = false

		return &GameClock{
			GameId:           g.id,
			SecondsRemaining: &remaining,
			IsRunning:        isRunning,
		}, nil
	}

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
		               SET secondsRemaining = secondsRemaining - TIMESTAMPDIFF(SECOND, clockStartTime, CURRENT_TIMESTAMP)
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
