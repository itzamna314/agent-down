package api

import (
	"dal"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
)

type playerRequest struct {
	Player dal.Player `json:"player"`
}

type playersRequest struct {
	Players []dal.Player `json:"players"`
}

func ServePlayers(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/players"):]
	if len(id) > 0 {
		id = id[1:]
	}

	playerId, idErr := strconv.Atoi(id)

	db, err := dal.Open()
	if err != nil {
		log.Printf("Failed to connect to db: %s\n", err)
		http.Error(w, "failed to create game", 500)
		return
	}
	defer db.Close()

	b, err := ioutil.ReadAll(r.Body)

	if err != nil && r.Method != "GET" {
		log.Printf("Failed to read body %v\n", r.Body)
		http.Error(w, "Could not read body", 400)
		return
	}

	switch r.Method {
	case "GET":
		if idErr != nil {
			findPlayers(w, r)
		} else {
			fetchPlayer(w, r, playerId)
		}
	case "POST":
		if idErr == nil {
			http.Error(w, "POST to /id not allowed", 405)
			return
		}
		createPlayer(w, db, b)
	case "PUT":
		if idErr != nil {
			http.Error(w, "PUT requires id", 405)
			return
		}
		replacePlayer(w, db, b, playerId)
	case "DELETE":
		if idErr != nil {
			http.Error(w, "DELETE requires id", 405)
			return
		}
		deletePlayer(w, db, playerId)
	default:
		http.Error(w, fmt.Sprintf("Method %s not recognized", r.Method), 405)
	}
}

func findPlayers(w http.ResponseWriter, r *http.Request) {
	db, err := dal.Open()

	if err != nil {
		log.Printf("Failed to open db: %s\n", err)
		http.Error(w, "Failed to connect to db", 500)
		return
	}

	defer db.Close()

	players, err := dal.FindAllPlayers(db)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to query db: %s", err), 500)
		return
	}

	j, err := json.Marshal(players)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to marshal to json: %v", players), 500)
		return
	}

	w.Write(j)
}

func fetchPlayer(w http.ResponseWriter, r *http.Request, id int) {
	db, err := dal.Open()

	if err != nil {
		log.Printf("Failed to open db: %s\n", err)
		http.Error(w, "Failed to connect to db", 500)
		return
	}

	defer db.Close()

	player, err := dal.FetchPlayer(db, int64(id))

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to query db: %s", err), 500)
		return
	}

	resp := playerRequest{
		Player: *player,
	}

	j, err := json.Marshal(resp)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to marshal to json: %v", resp), 500)
		return
	}

	w.Write(j)
}

func createPlayer(w http.ResponseWriter, db *sql.DB, b []byte) {
	var body playerRequest

	if err := json.Unmarshal(b, &body); err != nil {
		log.Printf("Failed to unmarshal body %s\n", b)
		http.Error(w, "Could not parse body", 400)
		return
	}

	if body.Player.Name == nil {
		log.Printf("Bad request: missing name")
		http.Error(w, "Name is required", 400)
		return
	}

	player, err := dal.CreatePlayer(db, &body.Player)

	if err != nil {
		log.Printf("Failed to create player: %s", err)
		http.Error(w, "Failed to create player", 500)
		return
	}

	body.Player = *player

	j, err := json.Marshal(body)

	if err != nil {
		log.Printf("Failed to marshal to json: %v", body)
		http.Error(w, "Failed to marshal to json", 500)
		return
	}

	w.Write(j)
}

func replacePlayer(w http.ResponseWriter, db *sql.DB, b []byte, id int) {
	var body playerRequest

	if err := json.Unmarshal(b, &body); err != nil {
		log.Printf("Failed to unmarshal body %s\n", b)
		http.Error(w, "Could not read body", 400)
		return
	}

	p, err := dal.ReplacePlayer(db, int64(id), &body.Player)

	if err != nil {
		log.Printf("Failed to create player: %s\n", err)
		http.Error(w, "Failed to create player", 500)
		return
	}

	resp := playersRequest{
		Players: []dal.Player{*p},
	}

	j, err := json.Marshal(resp)

	if err != nil {
		log.Printf("Failed to marshal to json: %v\n", resp)
		http.Error(w, "Failed to serialize player", 500)
		return
	}

	w.Write(j)
}

func deletePlayer(w http.ResponseWriter, db *sql.DB, id int) {
	err := dal.RemovePlayer(db, int64(id))

	if err != nil {

		log.Println(err)
		http.Error(w, "Failed to delete player", 500)
	} else {
		w.WriteHeader(204)
	}
}
