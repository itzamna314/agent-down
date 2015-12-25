package api

import (
	"dal"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
)

type locationRequest struct {
	Location dal.Location `json:"location"`
}

type locationsRequest struct {
	Locations []dal.Location `json:"locations"`
}

func ServeLocations(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/locations"):]
	if len(id) > 0 {
		id = id[1:]
	}

	locationId, idErr := strconv.Atoi(id)

	db, err := dal.Open()
	if err != nil {
		log.Printf("Failed to connect to db: %s\n", err)
		http.Error(w, "failed to create game", 500)
		return
	}
	defer db.Close()

	_, err = ioutil.ReadAll(r.Body)

	if err != nil {
		log.Printf("Failed to read body %v\n", r.Body)
		http.Error(w, "Could not read body", 400)
		return
	}

	switch r.Method {
	case "GET":
		if idErr != nil {
			findLocations(w, db, r.URL)
		} else {
			fetchLocation(w, db, locationId)
		}
	case "POST":
		http.Error(w, "POST not implemented", 405)
		return
	case "PUT":
		http.Error(w, "PUT not implemented", 405)
	case "DELETE":
		http.Error(w, "DELETE not implemented", 405)
	default:
		http.Error(w, fmt.Sprintf("Method %s not recognized", r.Method), 405)
	}
}

func fetchLocation(w http.ResponseWriter, db *sql.DB, id int) {
	location, err := dal.FetchLocation(db, int64(id))

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to query db: %s", err), 500)
		return
	}

	resp := locationRequest{
		Location: *location,
	}

	j, err := json.Marshal(resp)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to marshal to json: %v", resp), 500)
		return
	}

	w.Write(j)
}

func findLocations(w http.ResponseWriter, db *sql.DB, url *url.URL) {
	locations, err := dal.ListLocations(db)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to query db: %s", err), 500)
		return
	}

	resp := locationsRequest{
		Locations: make([]dal.Location, len(locations), len(locations)),
	}

	for idx, l := range locations {
		resp.Locations[idx] = *l
	}

	j, err := json.Marshal(resp)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to marshal to json: %v", resp), 500)
		return
	}

	w.Write(j)
}
