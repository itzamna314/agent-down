package hub

import (
	"log"
	"net/http"
	"strconv"
)

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

	// Launch a new goroutine for the write pump.
	// This goroutine is responsible for writing to all
	// clients attached to this connection
	// It will periodically try to write a ping message to the
	// client.  If the client disconnects, it will fail and end the
	// goroutine.
	go c.writePump()

	// Run the read pump in this goroutine.
	// The read pump expects to receive a 'pong' message periodically.
	// If it doesn't, it will hang up.
	// The ping message that triggers the pong response is originated from
	// the write pump.  If we don't receive a response, we will disconnect.
	// The write pump will then disconnect next time it tries to write a ping.
	c.readPump(Games.cleanup, Games.handle)
}
