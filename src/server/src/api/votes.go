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
	http.Error(w, "Method not implemented", 405)
}

func fetchVote(w http.ResponseWriter, db *sql.DB, id int) {
	db, err := dal.Open()

	if err != nil {
		log.Printf("Failed to open db: %s\n", err)
		http.Error(w, "Failed to connect to db", 500)
		return
	}

	defer db.Close()

	vote, err := dal.FetchVote(db, int64(id))

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to query db: %s", err), 500)
		return
	}

	resp := voteRequest{
		Vote: *vote,
	}

	j, err := json.Marshal(resp)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to marshal to json: %v", resp), 500)
		return
	}

	w.Write(j)
}

func createVote(w http.ResponseWriter, db *sql.DB, b []byte) {
	var body voteRequest

	if err := json.Unmarshal(b, &body); err != nil {
		log.Printf("Failed to unmarshal body %s\n", b)
		http.Error(w, "Could not parse body", 400)
		return
	}

	if body.Vote.PlayerId == nil || body.Vote.AccusationId == nil || body.Vote.Accuse == nil {
		log.Printf("Player, Accusation, and Vote are required\n")
		http.Error(w, "Player, Accusation, and Vote are required", 400)
		return
	}

	vote, err := dal.CreateVote(db, &body.Vote)

	if err != nil {
		log.Printf("Failed to create vote: %s", err)
		http.Error(w, "Failed to create vote", 500)
		return
	}

	body.Vote = *vote

	j, err := json.Marshal(body)

	if err != nil {
		log.Printf("Failed to marshal to json: %v", body)
		http.Error(w, "Failed to marshal to json", 500)
		return
	}

	state, err := dal.CheckAccusationState(db, int(*vote.AccusationId))

	if state == "guilty" {
		VotedGuilty(vote.AccusationId, db)
	}

	w.Write(j)
}

func replaceVote(w http.ResponseWriter, db *sql.DB, b []byte, id int) {
	http.Error(w, "Method not implemented", 405)
}

func deleteVote(w http.ResponseWriter, db *sql.DB, id int) {
	http.Error(w, "Method not implemented", 405)
}
