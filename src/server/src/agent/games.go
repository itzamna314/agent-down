package main

import (
	"dal"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

func serveGames(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Serving games")

	id := r.URL.Path[len("/api/games"):]
	if len(id) > 0 {
		id = id[1:]
	}

	gameId, err := strconv.Atoi(id)

	switch r.Method {
	case "GET":
		if err != nil {
			findGames(w, r)
		} else {
			fetchGame(w, r, gameId)
		}
	case "POST":
		if err == nil {
			http.Error(w, "POST to /id not allowed", 405)
			return
		}
		createGame(w, r)
	case "PUT":
		if err != nil {
			http.Error(w, "PUT requires id", 405)
			return
		}
		replaceGame(w, r, gameId)
	case "DELETE":
		if err != nil {
			http.Error(w, "DELETE requires id", 405)
			return
		}
		deleteGame(w, r, gameId)
	default:
		http.Error(w, fmt.Sprintf("Method %s not recognized", r.Method), 405)
	}
}

func findGames(w http.ResponseWriter, r *http.Request) {
	db, err := dal.Open()
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

func fetchGame(w http.ResponseWriter, r *http.Request, id int) {

}

func createGame(w http.ResponseWriter, r *http.Request) {
	db, err := dal.Open()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to connect to db: %s", err), 500)
	}

	_, err = dal.CreateGame(db)
}

func replaceGame(w http.ResponseWriter, r *http.Request, id int) {

}

func deleteGame(w http.ResponseWriter, r *http.Request, id int) {

}
