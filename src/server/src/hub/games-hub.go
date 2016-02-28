package hub

import (
	"dal"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
)

type gamesHub struct {
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

var Games = gamesHub{
	games:       make(map[int]*hub),
	connections: make(map[*connection]int),
	register:    make(chan *gameConnection),
	unregister:  make(chan *connection),
	broadcast:   make(chan *gameMessage),
}

func (h *gamesHub) Run() {
	go h.listenForClockEvents()

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
				log.Printf("Broadcast to game id: %v\n", m.gameId)
				select {
				case g.broadcast <- m.message:
				default:
					close(g.broadcast)
					delete(h.games, m.gameId)
				}
			} else {
				log.Printf("Failed to broadcast message: %v\n", m)
			}
		}
	}
}

func (h *gamesHub) listenForClockEvents() {
	for {
		select {
		case c := <-dal.GameClockEvents:
			d := ClockData{
				Command:          "clock",
				SecondsRemaining: int(*c.SecondsRemaining),
				IsRunning:        *c.IsRunning,
			}

			if err := h.broadcastGameMessage(d, *c.GameId); err != nil {
				log.Printf("Failed to broadcast message: %s\n", err)
			}
		}
	}
}

func (h *gamesHub) cleanup(c *connection) {
	h.unregister <- c
	c.ws.Close()
}

type GameCommand struct {
	Name string
	Data map[string]interface{}
}

type CreateData struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type PlayerData struct {
	Command  string `json:"command"`
	PlayerId int64  `json:"playerId"`
}

type AccuseData struct {
	Command      string `json:"command"`
	AccusationId string `json:"accusation"`
}

type EmptyData struct {
	Command string `json:"command"`
}

type ClockData struct {
	Command          string `json:"command"`
	SecondsRemaining int    `json:"secondsRemaining"`
	IsRunning        bool   `json:"isRunning"`
}

func (h *gamesHub) handle(c *connection, msg []byte, t int) {
	var command GameCommand
	if err := json.Unmarshal(msg, &command); err != nil {
		log.Println(err)
		log.Printf("String: %s\n", msg)
		return
	}

	gameId, ok := Games.connections[c]
	if !ok {
		log.Println("Connection was not registered")
		return
	}

	switch command.Name {
	case "created":
		d := CreateData{
			Latitude:  command.Data["latitude"].(float64),
			Longitude: command.Data["longitude"].(float64),
		}
		h.handleCreated(&d)

	case "left", "kicked", "nominated", "joined":
		playerId, err := h.parsePlayerId(command)

		if err != nil {
			log.Printf("Failed to join game %d: %s\n", gameId, err)
			return
		}

		d := PlayerData{
			Command:  command.Name,
			PlayerId: *playerId,
		}

		if err := h.broadcastGameMessage(d, gameId); err != nil {
			log.Printf("Failed to handle accused: %v. %v\n", d, err)
		}
		//h.unregister <- c

	case "abandoned", "started", "voted", "guessed":
		d := EmptyData{
			Command: command.Name,
		}

		if err := h.broadcastGameMessage(d, gameId); err != nil {
			log.Printf("Failed to handle accused: %v. %v\n", d, err)
		}
		//h.unregister <- c

	case "accused":
		d := AccuseData{
			Command:      "accused",
			AccusationId: command.Data["accusation"].(string),
		}

		if err := h.broadcastGameMessage(d, gameId); err != nil {
			log.Printf("Failed to handle accused: %v. %v\n", d, err)
		}

	case "clock":
		conn, err := dal.Open()
		if err != nil {
			return
		}

		clock, err := dal.GetGameClock(conn, int64(gameId))

		if err != nil {
			return
		}

		d := ClockData{
			Command:          "clock",
			SecondsRemaining: int(*clock.SecondsRemaining),
			IsRunning:        *clock.IsRunning,
		}

		if err := h.broadcastGameMessage(d, gameId); err != nil {
			log.Printf("Failed to broadcast message: %s\n", err)
		}
	}
}

func (h *gamesHub) parsePlayerId(command GameCommand) (*int64, error) {
	i, err := strconv.Atoi(command.Data["playerId"].(string))

	if err != nil {
		return nil, fmt.Errorf("Illegal player id: %s\n", i)
	}

	typedI := int64(i)

	return &typedI, nil
}

func (h *gamesHub) broadcastGameMessage(d interface{}, gameId int) error {
	j, err := json.Marshal(&d)

	if err != nil {
		log.Printf("Failed to marshal\n")
		return fmt.Errorf("Failed to marshall data: %v\n", d)
	}

	msg := gameMessage{
		gameId:  gameId,
		message: j,
	}

	h.broadcast <- &msg

	return nil
}

// Broadcast to join hub
func (h *gamesHub) handleCreated(data *CreateData) {
	if b, err := json.Marshal(data); err == nil {
		Lobby.h.broadcast <- b
	} else {
		log.Println(err)
	}
}
