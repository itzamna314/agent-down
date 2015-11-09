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

type accusationRequest struct {
	Accusation dal.Accusation `json:"accusation"`
}

func ServeAccusations(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/accusations"):]
	if len(id) > 0 {
		id = id[1:]
	}

	accusationId, idErr := strconv.Atoi(id)

	db, err := dal.Open()
	if err != nil {
		log.Printf("Failed to connect to db: %s\n", err)
		http.Error(w, "failed to create vote", 500)
		return
	}
	defer db.Close()

	b, err := ioutil.ReadAll(r.Body)

	if err != nil {
		log.Printf("Failed to read body %v\n", r.Body)
		http.Error(w, "Could not read body", 400)
		return
	}

	switch r.Method {
	case "GET":
		if idErr != nil {
			findAccusations(w, db, r.URL)
		} else {
			fetchAccusation(w, db, accusationId)
		}
	case "POST":
		if idErr == nil {
			checkState(w, db, b, accusationId)
			return
		}
		createAccusation(w, db, b)
	case "PUT":
		if idErr != nil {
			http.Error(w, "PUT requires id", 405)
			return
		}
		replaceAccusation(w, db, b, accusationId)
	case "DELETE":
		if idErr != nil {
			http.Error(w, "DELETE requires id", 405)
			return
		}
		deleteAccusation(w, db, accusationId)
	default:
		http.Error(w, fmt.Sprintf("Method %s not recognized", r.Method), 405)
	}
}

func findAccusations(w http.ResponseWriter, db *sql.DB, url *url.URL) {
	http.Error(w, "Method not implemented", 405)
}

func fetchAccusation(w http.ResponseWriter, db *sql.DB, id int) {
	accusation, err := dal.FetchAccusation(db, int64(id))

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to query db: %s", err), 500)
		return
	}

	resp := accusationRequest{
		Accusation: *accusation,
	}

	j, err := json.Marshal(resp)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to marshal to json: %v", resp), 500)
		return
	}

	w.Write(j)
}

func createAccusation(w http.ResponseWriter, db *sql.DB, b []byte) {
	var body accusationRequest

	if err := json.Unmarshal(b, &body); err != nil {
		log.Printf("Failed to unmarshal body %s\n", b)
		http.Error(w, "Could not parse body", 400)
		return
	}

	if body.Accusation.AccuserId == nil || body.Accusation.AccusedId == nil || body.Accusation.GameId == nil {
		log.Printf("Accuser, Accused, and Accusation are required\n")
		http.Error(w, "Accuser, Accused, and Accusation are required", 400)
		return
	}

	accusation, err := dal.CreateAccusation(db, &body.Accusation)

	if err != nil {
		log.Printf("Failed to create accusation: %s", err)
		http.Error(w, "Failed to create accusation", 400)
		return
	}

	body.Accusation = *accusation

	j, err := json.Marshal(body)

	if err != nil {
		log.Printf("Failed to marshal to json: %v", body)
		http.Error(w, "Failed to marshal to json", 500)
		return
	}

	w.Write(j)
}

func checkState(w http.ResponseWriter, db *sql.DB, b []byte, id int) {
	state, err := dal.UpdateAccusationState(db, id)

	if err != nil {
		log.Printf("Failed to check state: %s\n", err)
	}

	http.Error(w, fmt.Sprintf("State: %s", state), 200)
}

func replaceAccusation(w http.ResponseWriter, db *sql.DB, b []byte, id int) {
	http.Error(w, "Method not implemented", 405)
}

func deleteAccusation(w http.ResponseWriter, db *sql.DB, id int) {
	http.Error(w, "Method not implemented", 405)
}
