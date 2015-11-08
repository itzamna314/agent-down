package hub

type lobbyHub struct {
	h *hub
}

var Lobby = lobbyHub{
	h: makeHub(),
}

func (j *lobbyHub) Run() {
	j.h.run()
}

func (j *lobbyHub) cleanup(c *connection) {
	j.h.unregister <- c
	c.ws.Close()
}

func (j *lobbyHub) handle(c *connection, msg []byte, t int) {

}
