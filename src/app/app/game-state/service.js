import Ember from 'ember';

export default Ember.Service.extend({
    game: null,
    player: null,
    socket: null,
    socketService: Ember.inject.service('websockets'),
    newGame: function(store, creatorName, doneFunc) {
        var self = this;

        var game = store.createRecord('game', {
            createdOn: '08/30/2015',
            state: 'awaitingPlayers'
        });

        var gamePromise = game.save();

        gamePromise.then(function(game) {
            var player = store.createRecord('player', {
                game: game,
                name: creatorName,
                isCreator: true,
                hasAccused: null,
                isSpy: null
            });

            player.save().then(function(player){
                self.createSocket(game.get('id'));

                game.set('creator', player);

                game.save().then(function(game){
                    self.game = game;
                    doneFunc(game);
                });
            });
        });


    },
    initPlayer: function(store, playerName, doneFunc) {
        var self = this;

        store.createRecord('player', {
            name: playerName
        }).save().then(function(player){
            self.player = player;
            doneFunc(player);
        });
    },
    joinGame: function(store, game, doneFunc) {
        if ( this.player == null ) {
            doneFunc();
            return;
        }

        var self = this;

        this.player.set('game', game);
        this.player.save().then(function(){
            self.createSocket(game.get('id'), function(sock){
                self.sendSocket({
                    name: "joined",
                    data: {
                        playerId: self.player.get('id')
                    }
                })
            });
            doneFunc(game);
        });
    },
    createSocket: function(id, onOpen){
        var socket = this.get('socketService').socketFor('ws://localhost:8080/ws/create/' + id);

        socket.on('open', function(){
            onOpen && onOpen(socket);
            console.log('socket opened');
        }, this);
        socket.on('message', function(event){
            var d = JSON.parse(event.data);

            switch(d.command){
                case "joined":
                    this.get('game').reload();
                    break;
            }
        }, this);
        socket.on('close', function() {
            console.log('socket closed');
        }, this);

        this.set('socket', socket);
    },
    sendSocket: function(msg) {
        var socket = this.get('socket');
        socket.send(JSON.stringify(msg));
    },
    setGeoPosition: function(coordinates){
        var game = this.get('game');
        game.set('latitude', coordinates.latitude);
        game.set('longitude', coordinates.longitude);

        game.save().then(function(game){
            this.sendSocket({
                name: "created",
                data: {
                    latitude: game.latitude,
                    longitude: game.longitude
                }
            });
        }.bind(this));
    }
});
