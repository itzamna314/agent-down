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
	Latitude        *float64 `json:"latitude"`
	Longitude       *float64 `json:"longitude"`
	Creator         *int64   `json:"creator,string"`
	Spy             *int64   `json:"spy,string"`
	Accuser         *int64   `json:"accuser,string"`
	Accused         *int64   `json:"accused,string"`
	PlayerIds       []string `json:"players"`
}

type gameDto struct {
	id          *int
	locationId  *sql.NullInt64
	state       *string
	victoryType *sql.NullString
	latitude    *sql.NullFloat64
	longitude   *sql.NullFloat64
	creatorId   *sql.NullInt64
	spyId       *sql.NullInt64
	accuserId   *sql.NullInt64
	accusedId   *sql.NullInt64
	playerIds   []int64
}

func newGameDto() *gameDto {
	return &gameDto{
		id:          new(int),
		locationId:  new(sql.NullInt64),
		state:       new(string),
		victoryType: new(sql.NullString),
		latitude:    new(sql.NullFloat64),
		longitude:   new(sql.NullFloat64),
		creatorId:   new(sql.NullInt64),
		spyId:       new(sql.NullInt64),
		accuserId:   new(sql.NullInt64),
		accusedId:   new(sql.NullInt64),
		playerIds:   nil,
	}
}

func (g *gameDto) ToGame() *Game {
	return &Game{
		Id:          g.id,
		LocationId:  IntOrNull(g.locationId),
		State:       g.state,
		VictoryType: StringOrNull(g.victoryType),
		Latitude:    FloatOrNull(g.latitude),
		Longitude:   FloatOrNull(g.longitude),
		Creator:     IntOrNull(g.creatorId),
		Spy:         IntOrNull(g.spyId),
		Accuser:     IntOrNull(g.accuserId),
		Accused:     IntOrNull(g.accusedId),
		PlayerIds:   IntsToStrings(g.playerIds),
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
