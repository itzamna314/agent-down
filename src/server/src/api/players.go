package api

import (
	"dal"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

func ServePlayers(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Serving players")

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
	defer db.Close()

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to open db: %s", err), 500)
		return
	}

	var state = r.URL.Query().Get("state")
	var games []*dal.Game

	if len(state) != 0 {
		games, err = dal.FindGames(db, state)
	} else {
		games, err = dal.FindAllGames(db)
	}

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to query db: %s", err), 500)
		return
	}

	j, err := json.Marshal(games)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to marshal to json: %v", games), 500)
		return
	}

	w.Write(j)
}

func fetchPlayer(w http.ResponseWriter, r *http.Request, id int) {

}

func createPlayer(w http.ResponseWriter, r *http.Request) {

}

func replacePlayer(w http.ResponseWriter, r *http.Request, id int) {

}

func deletePlayer(w http.ResponseWriter, r *http.Request, id int) {

}
