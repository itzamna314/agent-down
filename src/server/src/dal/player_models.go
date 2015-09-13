package dal

import (
	"database/sql"
	"strconv"
)

type Player struct {
	Id             *string `json:"id"`
	Name           *string `json:"name"`
	GameId         *int64  `json:"game,string"`
	IsSpy          *bool   `json:"isSpy"`
	IsBeingAccused *bool   `json:"isBeingAccused"`
	IsCreator      *bool   `json:"isCreator"`
	HasAccused     *bool   `json:"hasAccused"`
}

type playerDto struct {
	id             *int
	name           *string
	gameId         *sql.NullInt64
	isSpy          *sql.NullInt64
	isBeingAccused *sql.NullInt64
	isCreator      *sql.NullInt64
	hasAccused     *sql.NullInt64
}

func newPlayerDto() *playerDto {
	return &playerDto{
		id:             new(int),
		name:           new(string),
		gameId:         new(sql.NullInt64),
		isSpy:          new(sql.NullInt64),
		isBeingAccused: new(sql.NullInt64),
		isCreator:      new(sql.NullInt64),
		hasAccused:     new(sql.NullInt64),
	}
}

func (p *playerDto) ToPlayer() *Player {
	idStr := strconv.Itoa(*p.id)

	return &Player{
		Id:             &idStr,
		Name:           p.name,
		GameId:         IntOrNull(p.gameId),
		IsSpy:          BoolOrNull(p.isSpy),
		IsBeingAccused: BoolOrNull(p.isBeingAccused),
		IsCreator:      BoolOrNull(p.isCreator),
		HasAccused:     BoolOrNull(p.hasAccused),
	}
}
