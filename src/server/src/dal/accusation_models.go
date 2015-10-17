package dal

type Accusation struct {
	Id           *int    `json:"id,string"`
	AccuserId    *int64  `json:"accuser,string"`
	AccusedId    *int64  `json:"accused,string"`
	GameId       *int64  `json:"game,string"`
	Time         *int64  `json:"time"`
	VotesFor     *int64  `json:"votesFor"`
	VotesAgainst *int64  `json:"votesAgainst"`
	State        *string `json:"state"`
}

type accusationDto struct {
	id           *int
	accuserId    *int64
	accusedId    *int64
	gameId       *int64
	time         *int64
	votesFor     *int64
	votesAgainst *int64
	state        *string
}

func newAccusationDto() *accusationDto {
	return &accusationDto{
		id:           new(int),
		accuserId:    new(int64),
		accusedId:    new(int64),
		gameId:       new(int64),
		time:         new(int64),
		votesFor:     new(int64),
		votesAgainst: new(int64),
		state:        new(string),
	}
}

func (a *accusationDto) ToAccusation() *Accusation {
	return &Accusation{
		Id:           a.id,
		AccuserId:    a.accuserId,
		AccusedId:    a.accusedId,
		GameId:       a.gameId,
		Time:         a.time,
		VotesFor:     a.votesFor,
		VotesAgainst: a.votesAgainst,
		State:        a.state,
	}
}
