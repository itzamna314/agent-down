package dal

type Vote struct {
	Id           *int   `json:"id,string"`
	PlayerId     *int64 `json:"player,string"`
	AccusationId *int64 `json:"accusation,string"`
	Accuse       *bool  `json:"accuse"`
}

type playerAccusationDto struct {
	id           *int
	playerId     *int64
	accusationId *int64
	accuse       *bool
}

func newPlayerAccusationDto() *playerAccusationDto {
	return &playerAccusationDto{
		id:           new(int),
		playerId:     new(int64),
		accusationId: new(int64),
		accuse:       new(bool),
	}
}

func (pa *playerAccusationDto) ToVote() *Vote {
	return &Vote{
		Id:           pa.id,
		PlayerId:     pa.playerId,
		AccusationId: pa.accusationId,
		Accuse:       pa.accuse,
	}
}
