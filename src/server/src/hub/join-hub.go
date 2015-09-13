package hub

type joinHub struct {
	h *hub
}

var Join = joinHub{
	h: makeHub(),
}

func (j *joinHub) Run() {
	j.h.run()
}

func (j *joinHub) cleanup(c *connection) {
	j.h.unregister <- c
	c.ws.Close()
}

func (j *joinHub) handle(c *connection, msg []byte, t int) {

}
