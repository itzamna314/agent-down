package dal

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

func Open() (db *sql.DB, err error) {
	db, err = sql.Open("mysql", "tcp(127.0.0.1:3306)/test")
	return
}
