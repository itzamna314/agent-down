package main

import (
	"api"
	"dal"
	"flag"
	"fmt"
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

func helloWorld(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("hello world"))
}

func main() {
	port := flag.Int("port", 8080, "Specify which port to serve")
	conn := flag.String("conn", "WebClient@tcp(localhost:3306)/agent", "MySql connection string")
	flag.Parse()

	dal.Init(conn)

	go hub.Join.Run()
	go hub.Create.Run()

	fs := http.FileServer(http.Dir("www"))
	http.Handle("/", fs)

	http.HandleFunc("/ws/join", hub.ServeJoin)
	http.HandleFunc("/ws/create/", hub.ServeCreate)

	http.HandleFunc("/api/games", addDefaultHeaders(api.ServeGames))
	http.HandleFunc("/api/games/", addDefaultHeaders(api.ServeGames))

	http.HandleFunc("/api/players", addDefaultHeaders(api.ServePlayers))
	http.HandleFunc("/api/players/", addDefaultHeaders(api.ServePlayers))

	err := http.ListenAndServe(fmt.Sprintf(":%d", *port), nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
