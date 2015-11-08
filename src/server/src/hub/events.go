package hub

import (
	"log"
	"net/http"
	"strconv"
)

func ServeLobby(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	c := &connection{send: make(chan []byte, 256), ws: ws}
	Lobby.h.register <- c
	go c.writePump()
	c.readPump(Lobby.cleanup, Lobby.handle)
}

func ServeGames(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	id := r.URL.Path[len("/ws/create/"):]

	gameId, err := strconv.Atoi(id)
	if err != nil {
		log.Println(err)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	c := &connection{send: make(chan []byte, 256), ws: ws}
	gc := &gameConnection{connection: c, gameId: gameId}
	Games.register <- gc

	go c.writePump()
	c.readPump(Games.cleanup, Games.handle)
}
