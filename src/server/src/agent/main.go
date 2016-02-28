package main

import (
	"api"
	"dal"
	"flag"
	"fmt"
	"hub"
	"log"
	"math/rand"
	"net/http"
	"time"
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
	port := flag.Int("port", 8080, "Specify which port to serve")
	conn := flag.String("conn", "WebClient@tcp(localhost:3306)/agent", "MySql connection string")
	flag.Parse()

	dal.Init(conn)

	rand.Seed(time.Now().UTC().UnixNano())

	go hub.Lobby.Run()
	go hub.Games.Run()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		file := r.URL.Path[len("/"):]
		if len(file) == 0 {
			http.ServeFile(w, r, "www/index.html")
		} else {
			http.ServeFile(w, r, fmt.Sprintf("www/%s", file))
		}
	})

	fs := http.FileServer(http.Dir("www"))
	http.Handle("/assets/", fs)

	http.HandleFunc("/ws/join", hub.ServeLobby)
	http.HandleFunc("/ws/create/", hub.ServeGames)

	http.HandleFunc("/api/games", addDefaultHeaders(api.ServeGames))
	http.HandleFunc("/api/games/", addDefaultHeaders(api.ServeGames))

	http.HandleFunc("/api/players", addDefaultHeaders(api.ServePlayers))
	http.HandleFunc("/api/players/", addDefaultHeaders(api.ServePlayers))

	http.HandleFunc("/api/locations", addDefaultHeaders(api.ServeLocations))
	http.HandleFunc("/api/locations/", addDefaultHeaders(api.ServeLocations))

	http.HandleFunc("/api/accusations", addDefaultHeaders(api.ServeAccusations))
	http.HandleFunc("/api/accusations/", addDefaultHeaders(api.ServeAccusations))

	http.HandleFunc("/api/votes", addDefaultHeaders(api.ServeVotes))
	http.HandleFunc("/api/votes/", addDefaultHeaders(api.ServeVotes))

	err := http.ListenAndServe(fmt.Sprintf(":%d", *port), nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
