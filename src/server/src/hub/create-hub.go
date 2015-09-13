package hub

import (
	"encoding/json"
	"log"
)

type createHub struct {
	// Each game is represented with a hub
	games map[int]*hub
	// Track which connection belongs to which game
	connections map[*connection]int
	// Channels to interact with the members
	register   chan *gameConnection
	unregister chan *connection
	broadcast  chan *gameMessage
}

type gameConnection struct {
	gameId     int
	connection *connection
}

type gameMessage struct {
	gameId  int
	message []byte
}

var Create = createHub{
	games:       make(map[int]*hub),
	connections: make(map[*connection]int),
	register:    make(chan *gameConnection),
	unregister:  make(chan *connection),
	broadcast:   make(chan *gameMessage),
}

func (h *createHub) Run() {
	for {
		select {
		case g := <-h.register:
			game, ok := h.games[g.gameId]

			if !ok || game == nil {
				game = makeHub()
				go game.run()
				h.games[g.gameId] = game
			}

			h.connections[g.connection] = g.gameId
			game.register <- g.connection
		case c := <-h.unregister:
			if i, ok := h.connections[c]; ok {
				if g, ok := h.games[i]; ok {
					g.unregister <- c

					if len(g.connections) == 0 {
						g.kill <- true
						delete(h.games, i)
					}
				}
			}
		case m := <-h.broadcast:
			if g, ok := h.games[m.gameId]; ok {
				select {
				case g.broadcast <- m.message:
				default:
					close(g.broadcast)
					delete(h.games, m.gameId)
				}
			}
		}
	}
}

func (h *createHub) cleanup(c *connection) {
	h.unregister <- c
	c.ws.Close()
}

type GameCommand struct {
	Name string
	Data map[string]interface{}
}

type CreateData struct {
	Latitude  float64
	Longitude float64
}

func (h *createHub) handle(c *connection, msg []byte, t int) {
	var command GameCommand
	if err := json.Unmarshal(msg, &command); err != nil {
		log.Println(err)
		return
	}

	switch command.Name {
	case "created":
		d := CreateData{
			Latitude:  command.Data["latitude"].(float64),
			Longitude: command.Data["longitude"].(float64),
		}
		h.handleCreated(&d)
	}
}

// Broadcast to join hub
func (h *createHub) handleCreated(data *CreateData) {
	if b, err := json.Marshal(data); err == nil {
		Join.h.broadcast <- b
	} else {
		log.Println(err)
	}
}
