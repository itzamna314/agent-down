package main

import (
	"api"
	"hub"
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
	go hub.Join.Run()
	go hub.Create.Run()

	http.HandleFunc("/ws/join", hub.ServeJoin)
	http.HandleFunc("/ws/create/", hub.ServeCreate)

	http.HandleFunc("/api/games", addDefaultHeaders(api.ServeGames))
	http.HandleFunc("/api/games/", addDefaultHeaders(api.ServeGames))

	http.HandleFunc("/api/players", addDefaultHeaders(api.ServePlayers))
	http.HandleFunc("/api/players/", addDefaultHeaders(api.ServePlayers))

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
