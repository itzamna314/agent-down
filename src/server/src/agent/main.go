package main

import (
	"log"
	"net/http"
)

func addDefaultHeaders(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			return
		}

		fn(w, r)
	}
}

func main() {
	go join.h.run()
	go create.run()

	http.HandleFunc("/ws/join", serveJoin)
	http.HandleFunc("/ws/create/", serveCreate)

	http.HandleFunc("/api/games", addDefaultHeaders(serveGames))
	http.HandleFunc("/api/games/", addDefaultHeaders(serveGames))

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
