package dal

type Accusation struct {
	Id        *int     `json:"id,string"`
	AccuserId *int64   `json:"accuser,string"`
	AccusedId *int64   `json:"accused,string"`
	GameId    *int64   `json:"game,string"`
	Time      *int64   `json:"time"`
	State     *string  `json:"state"`
	VoteIds   []string `json:"votes"`
}

type accusationDto struct {
	id        *int
	accuserId *int64
	accusedId *int64
	gameId    *int64
	time      *int64
	state     *string
	voteIds   []int64
}

func newAccusationDto() *accusationDto {
	return &accusationDto{
		id:        new(int),
		accuserId: new(int64),
		accusedId: new(int64),
		gameId:    new(int64),
		time:      new(int64),
		state:     new(string),
		voteIds:   nil,
	}
}

func (a *accusationDto) ToAccusation() *Accusation {
	return &Accusation{
		Id:        a.id,
		AccuserId: a.accuserId,
		AccusedId: a.accusedId,
		GameId:    a.gameId,
		Time:      a.time,
		State:     a.state,
		VoteIds:   IntsToStrings(a.voteIds),
	}
}
