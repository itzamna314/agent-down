package dal

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"strconv"
)

var conn string

var dbDateLayout string = "2006-01-02 15:04:05"

type GameState string

const (
	GS_Awaiting       GameState = "awaitingPlayers"
	GS_InProgress               = "inProgress"
	GS_Voting                   = "voting"
	GS_TimeExpired              = "timeExpired"
	GS_FinalReckoning           = "finalReckoning"
	GS_SpyWins                  = "spyWins"
	GS_PlayersWin               = "playersWin"
)

var gameStateId map[GameState]int = map[GameState]int{
	GS_Awaiting:       1,
	GS_InProgress:     2,
	GS_Voting:         3,
	GS_TimeExpired:    4,
	GS_FinalReckoning: 5,
	GS_SpyWins:        6,
	GS_PlayersWin:     7,
}

type AccusationState string

const (
	AS_Voting   AccusationState = "voting"
	AS_Innocent                 = "innocent"
	AS_Guilty                   = "guilty"
)

var accusationStateId map[AccusationState]int = map[AccusationState]int{
	AS_Voting:   1,
	AS_Innocent: 2,
	AS_Guilty:   3,
}

type VictoryType string

const (
	VT_Guess   VictoryType = "guess"
	VT_Accuse              = "accuse"
	VT_Default             = "default"
)

var victoryTypeId map[VictoryType]int = map[VictoryType]int{
	VT_Guess:   1,
	VT_Accuse:  2,
	VT_Default: 3,
}

type DbErr int

const (
	ERR_NotFound DbErr = iota
)

func (e DbErr) Error() string {
	switch e {
	case ERR_NotFound:
		return "sql: Record not found"
	default:
		return "sql: An error occurred"
	}
}

func Init(c *string) {
	conn = *c
}

func Open() (db *sql.DB, err error) {
	db, err = sql.Open("mysql", conn)
	return
}

func IntOrNull(i *sql.NullInt64) *int64 {
	if i.Valid {
		return &i.Int64
	}

	return nil
}

func FloatOrNull(f *sql.NullFloat64) *float64 {
	if f.Valid {
		return &f.Float64
	}

	return nil
}

func BoolOrNull(b *sql.NullInt64) *bool {
	if ret := false; b.Valid {
		if b.Int64 > 0 {
			ret = true
		}
		return &ret
	}

	return nil
}

func StringOrNull(s *sql.NullString) *string {
	if s.Valid {
		return &s.String
	}

	return nil
}

func NullBool(b *bool) *sql.NullBool {
	if b == nil {
		return &sql.NullBool{
			Valid: false,
			Bool:  false,
		}
	}

	return &sql.NullBool{
		Valid: true,
		Bool:  *b,
	}
}

func IntsToStrings(i []int64) (ret []string) {
	for _, v := range i {
		ret = append(ret, strconv.Itoa(int(v)))
	}
	return
}
