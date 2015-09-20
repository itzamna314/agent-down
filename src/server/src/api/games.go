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

	gameId, idErr := strconv.Atoi(id)

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

	switch r.Method {
	case "GET":
		if idErr != nil {
			findGames(w, db, r.URL)
		} else {
			fetchGame(w, db, gameId)
		}
	case "POST":
		if idErr == nil {
			http.Error(w, "POST to /id not allowed", 405)
			return
		}
		createGame(w, db, b)
	case "PUT":
		if idErr != nil {
			http.Error(w, "PUT requires id", 405)
			return
		}
		replaceGame(w, db, b, gameId)
	case "DELETE":
		if idErr != nil {
			http.Error(w, "DELETE requires id", 405)
			return
		}
		deleteGame(w, db, gameId)
	default:
		http.Error(w, fmt.Sprintf("Method %s not recognized", r.Method), 405)
	}
}

func findGames(w http.ResponseWriter, db *sql.DB, url *url.URL) {
	db, err := dal.Open()
	if err != nil {
		log.Printf("Failed to open db: %s\n", err)
		http.Error(w, "Failed to open db", 500)
		return
	}
	defer db.Close()

	var state = url.Query().Get("state")
	var games []*dal.Game

	if len(state) != 0 {
		games, err = dal.FindGames(db, state)
	} else {
		games, err = dal.FindAllGames(db)
	}

	if err != nil {
		log.Printf("Failed to query db: %s\n", err)
		http.Error(w, "Failed to query db", 500)
		return
	}

	var respGames []dal.Game

	for _, g := range games {
		respGames = append(respGames, *g)
	}

	resp := gamesRequest{
		Games: respGames,
	}

	j, err := json.Marshal(resp)

	if err != nil {
		log.Printf("Failed to marshal to json: %v", resp)
		http.Error(w, "Failed to marshal to json", 500)
		return
	}

	w.Write(j)
}

func fetchGame(w http.ResponseWriter, db *sql.DB, id int) {
	game, err := dal.FetchGame(db, int64(id))

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to query db: %s", err), 500)
		return
	}

	resp := gameRequest{
		Game: *game,
	}

	j, err := json.Marshal(resp)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to marshal to json: %v", resp), 500)
		return
	}

	w.Write(j)
}

func createGame(w http.ResponseWriter, db *sql.DB, b []byte) {
	var body gameRequest

	if err := json.Unmarshal(b, &body); err != nil {
		log.Printf("Failed to unmarshal body %s\n", b)
		http.Error(w, "Could not read body", 400)
		return
	}

	g, err := dal.CreateGame(db, &body.Game)

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

func replaceGame(w http.ResponseWriter, db *sql.DB, b []byte, id int) {
	var body gameRequest

	if err := json.Unmarshal(b, &body); err != nil {
		log.Printf("Failed to unmarshal body %s\n", b)
		http.Error(w, "Could not read body", 400)
		return
	}

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

func deleteGame(w http.ResponseWriter, db *sql.DB, id int) {
	err := dal.RemoveGame(db, int64(id))

	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to delete game", 500)
	} else {
		w.WriteHeader(204)

	}
}
