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

type voteRequest struct {
	Vote dal.Vote `json:"vote"`
}

type votesRequest struct {
	Votes []dal.Vote `json:"votes"`
}

func ServeVotes(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/votes"):]
	if len(id) > 0 {
		id = id[1:]
	}

	voteId, idErr := strconv.Atoi(id)

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
			findVotes(w, db, r.URL)
		} else {
			fetchVote(w, db, voteId)
		}
	case "POST":
		if idErr == nil {
			http.Error(w, "POST to /id not allowed", 405)
			return
		}
		createVote(w, db, b)
	case "PUT":
		if idErr != nil {
			http.Error(w, "PUT requires id", 405)
			return
		}
		replaceVote(w, db, b, voteId)
	case "DELETE":
		if idErr != nil {
			http.Error(w, "DELETE requires id", 405)
			return
		}
		deleteVote(w, db, voteId)
	default:
		http.Error(w, fmt.Sprintf("Method %s not recognized", r.Method), 405)
	}
}

func findVotes(w http.ResponseWriter, db *sql.DB, url *url.URL) {

}

func fetchVote(w http.ResponseWriter, db *sql.DB, url *url.URL) {

}

func createVote(w http.ResponseWriter, db *sql.DB, b []byte) {

}

func replaceVote(w http.ResponseWriter, db *sql.DB, b []byte, id int) {

}

func deleteVote(w, db *sql.DB, b []byte, id int) {

}
