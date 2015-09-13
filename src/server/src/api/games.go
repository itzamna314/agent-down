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

type gameRequest struct {
	Game dal.Game `json:"game"`
}

type gamesRequest struct {
	Games []dal.Game `json:"games"`
}

func ServeGames(w http.ResponseWriter, r *http.Request) {
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
	defer db.Close()

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
		log.Printf("Failed to connect to db: %s\n", err)
		http.Error(w, "failed to create game", 500)
		return
	}
	defer db.Close()

	b, err := ioutil.ReadAll(r.Body)

	if err != nil {
		log.Printf("Failed to read body %v\n", r.Body)
		http.Error(w, "Could not read body", 400)
		return
	}

	var body gameRequest

	if err := json.Unmarshal(b, &body); err != nil {
		log.Printf("Failed to unmarshal body %s\n", b)
		http.Error(w, "Could not read body", 400)
		return
	}

	g, err := dal.CreateGame(db)

	if err != nil {
		log.Printf("Failed to create game: %s\n", err)
		http.Error(w, "Failed to create game", 500)
		return
	}

	body.Game = *g

	j, err := json.Marshal(body)

	if err != nil {
		log.Printf("Failed to marshal to json: %v\n", body)
		http.Error(w, "Failed to serialize game", 500)
		return
	}

	w.Write(j)
}

func replaceGame(w http.ResponseWriter, r *http.Request, id int) {
	db, err := dal.Open()
	if err != nil {
		log.Printf("Failed to connect to db: %s\n", err)
		http.Error(w, "failed to create game", 500)
		return
	}
	defer db.Close()

	b, err := ioutil.ReadAll(r.Body)

	if err != nil {
		log.Printf("Failed to read body %v\n", r.Body)
		http.Error(w, "Could not read body", 400)
		return
	}

	var body gameRequest

	if err := json.Unmarshal(b, &body); err != nil {
		log.Printf("Failed to unmarshal body %s\n", b)
		http.Error(w, "Could not read body", 400)
		return
	}

	log.Printf("body: %v\n", body.Game.Creator)

	g, err := dal.ReplaceGame(db, int64(id), &body.Game)

	if err != nil {
		log.Printf("Failed to create game: %s\n", err)
		http.Error(w, "Failed to create game", 500)
		return
	}

	resp := gamesRequest{
		Games: []dal.Game{*g},
	}

	j, err := json.Marshal(resp)

	if err != nil {
		log.Printf("Failed to marshal to json: %v\n", resp)
		http.Error(w, "Failed to serialize game", 500)
		return
	}

	w.Write(j)
}

func deleteGame(w http.ResponseWriter, r *http.Request, id int) {

}
