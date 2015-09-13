package dal

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

func Open() (db *sql.DB, err error) {
	db, err = sql.Open("mysql", "WebClient@tcp(localhost:3306)/agent")
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
