package api

import (
	"dal"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"strconv"
)

type accusationRequest struct {
	Accusation dal.Accusation `json:"accusation"`
}

type accusationsRequest struct {
	Accusations []dal.Accusation `json:"accusations"`
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
			fetchAccusation(w, db, voteId)
		}
	case "POST":
		if idErr == nil {
			http.Error(w, "POST to /id not allowed", 405)
			return
		}
		createAccusation(w, db, b)
	case "PUT":
		if idErr != nil {
			http.Error(w, "PUT requires id", 405)
			return
		}
		replaceAccusation(w, db, b, voteId)
	case "DELETE":
		if idErr != nil {
			http.Error(w, "DELETE requires id", 405)
			return
		}
		deleteAccusation(w, db, voteId)
	default:
		http.Error(w, fmt.Sprintf("Method %s not recognized", r.Method), 405)
	}
}

func findAccusations(w http.ResponseWriter, db *sql.DB, url *url.URL) {

}

func fetchAccusation(w http.ResponseWriter, db *sql.DB, url *url.URL) {

}

func createAccusation(w http.ResponseWriter, db *sql.DB, b []byte) {

}

func replaceAccusation(w http.ResponseWriter, db *sql.DB, b []byte, id int) {

}

func deleteAccusation(w, db *sql.DB, b []byte, id int) {

}
