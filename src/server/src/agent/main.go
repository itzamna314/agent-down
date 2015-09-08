package main

import (
	"log"
	"net/http"
)

func main() {
	go join.h.run()
	go create.run()

	http.HandleFunc("/ws/join", serveJoin)
	http.HandleFunc("/ws/create/", serveCreate)

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
