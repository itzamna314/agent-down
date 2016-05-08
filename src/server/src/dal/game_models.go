package dal

import (
	"database/sql"
)

type Game struct {
	Id              *int     `json:"id,string"`
	LocationId      *int64   `json:"location,string"`
	LocationGuessId *int64   `json:"locationGuess,string"`
	State           *string  `json:"state"`
	VictoryType     *string  `json:"victoryType"`
	Creator         *int64   `json:"creator,string"`
	Spy             *int64   `json:"spy,string"`
	PlayerIds       []string `json:"players"`
	AccusationIds   []string `json:"accusations"`
}

type gameDto struct {
	id              *int
	locationId      *sql.NullInt64
	locationGuessId *sql.NullInt64
	state           *string
	victoryType     *sql.NullString
	creatorId       *sql.NullInt64
	spyId           *sql.NullInt64
	playerIds       []int64
	accusationIds   []int64
}

func newGameDto() *gameDto {
	return &gameDto{
		id:              new(int),
		locationId:      new(sql.NullInt64),
		locationGuessId: new(sql.NullInt64),
		state:           new(string),
		victoryType:     new(sql.NullString),
		creatorId:       new(sql.NullInt64),
		spyId:           new(sql.NullInt64),
		playerIds:       nil,
		accusationIds:   nil,
	}
}

func (g *gameDto) ToGame() *Game {
	return &Game{
		Id:              g.id,
		LocationId:      IntOrNull(g.locationId),
		LocationGuessId: IntOrNull(g.locationGuessId),
		State:           g.state,
		VictoryType:     StringOrNull(g.victoryType),
		Creator:         IntOrNull(g.creatorId),
		Spy:             IntOrNull(g.spyId),
		PlayerIds:       IntsToStrings(g.playerIds),
		AccusationIds:   IntsToStrings(g.accusationIds),
	}
}

type GameClock struct {
	GameId           *int   `json:"gameId,string"`
	SecondsRemaining *int64 `json:"secondsRemaining"`
	IsRunning        *bool  `json:"isRunning"`
}

type gameClockDto struct {
	id               *int
	secondsRemaining *sql.NullInt64
	clockStartTime   *sql.NullString
	isRunning        *sql.NullInt64
}

func newGameClockDto() *gameClockDto {
	return &gameClockDto{
		id:               new(int),
		secondsRemaining: new(sql.NullInt64),
		clockStartTime:   new(sql.NullString),
		isRunning:        new(sql.NullInt64),
	}
}
