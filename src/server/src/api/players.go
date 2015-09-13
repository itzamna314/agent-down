package api

import (
	"dal"
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

	playerId, err := strconv.Atoi(id)

	switch r.Method {
	case "GET":
		if err != nil {
			findPlayers(w, r)
		} else {
			fetchPlayer(w, r, playerId)
		}
	case "POST":
		if err == nil {
			http.Error(w, "POST to /id not allowed", 405)
			return
		}
		createPlayer(w, r)
	case "PUT":
		if err != nil {
			http.Error(w, "PUT requires id", 405)
			return
		}
		replacePlayer(w, r, playerId)
	case "DELETE":
		if err != nil {
			http.Error(w, "DELETE requires id", 405)
			return
		}
		deletePlayer(w, r, playerId)
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

}

func createPlayer(w http.ResponseWriter, r *http.Request) {
	db, err := dal.Open()
	if err != nil {
		log.Printf("Failed to open db: %s\n", err)
		http.Error(w, "Failed to connect to db", 500)
		return
	}

	defer db.Close()

	b, err := ioutil.ReadAll(r.Body)

	if err != nil {
		log.Printf("Failed to read body %v\n", r.Body)
		http.Error(w, "Could not read body", 400)
		return
	}

	var body playerRequest

	if err := json.Unmarshal(b, &body); err != nil {
		log.Printf("Failed to unmarshal body %s\n", b)
		http.Error(w, "Could not parse body", 400)
		return
	}

	log.Printf("Body: %s\n", b)

	log.Printf("IsCreator: %v\n", body.Player.IsCreator)
	log.Printf("IsCreator: %v\n", *body.Player.IsCreator)

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

func replacePlayer(w http.ResponseWriter, r *http.Request, id int) {

}

func deletePlayer(w http.ResponseWriter, r *http.Request, id int) {

}
