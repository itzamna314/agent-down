package dal

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

func ListLocations(db *sql.DB) ([]*Location, error) {
	rows, err := db.Query(`SELECT id
		                        , name
		                        , imagePath AS imageUrl
		                     FROM location`)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var locations []*Location

	for rows.Next() {
		l := newLocationDto()
		err := rows.Scan(l.id, l.name, l.imageUrl)
		if err != nil {
			return nil, err
		}

		locations = append(locations, l.ToLocation())
	}

	return locations, nil
}

func FetchLocation(db *sql.DB, id int64) (*Location, error) {
	l := newLocationDto()
	row := db.QueryRow(`SELECT id
								, name
								, imagePath AS imageUrl
							 FROM location
							WHERE id=?`,
		id)

	err := row.Scan(l.id, l.name, l.imageUrl)
	if err != nil {
		return _, err
	}

	return l.ToLocation(), nil
}
