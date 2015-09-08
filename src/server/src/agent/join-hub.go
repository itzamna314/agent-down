package main

type joinHub struct {
	h *hub
}

var join = joinHub{
	h: makeHub(),
}

func (j *joinHub) cleanup(c *connection) {
	join.h.unregister <- c
	c.ws.Close()
}

func (j *joinHub) handle(c *connection, msg []byte, t int) {

}
