import Ember from 'ember';

import ENV from 'agent-down/config/environment';
import Cache from 'agent-down/game-state/model';

export default Ember.Service.extend({
    game: null,
    player: null,
    cache: Cache.create(),
    socketService: Ember.inject.service('websockets'),
    socket: null,
    socketInitialized: false,
    init: function() {
        this._super.apply(this, arguments);

        if (ENV.environment === 'production') {
            this.set('socketHost', 'ws://agentdown.com/ws/');
        } else {
            this.set('socketHost', 'ws://localhost:8080/ws/');
        }
    },
    initSocket: function(id, onOpen){
        if ( this.get('socketInitialized') ) {
            if ( onOpen ) { onOpen(); }
            return;
        }

        var socketUrl = this.get('socketHost') + 'create/' + id;

        var socket = this.get('socketService').socketFor(socketUrl);

        socket.on('open', function(){
            this.set('socketInitialized', true);
            this.set('socket', socket);
            if( onOpen ){ onOpen(); }
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

        }, this);
    },
    newGame: function(store, creatorName, doneFunc) {
        var game = store.createRecord('game', {
            createdOn: '08/30/2015',
            state: 'awaitingPlayers'
        });

        console.log(game);

        game.save().then(function(game) {
            this.set('game', game);

            var player = store.createRecord('player', {
                game: game,
                name: creatorName,
                isCreator: true,
                hasAccused: null,
                isSpy: null
            });

            player.save().then(function(player){
                this.set('player', player);

                this.initSocket(game.get('id'));

                game.set('creator', player);
                game.save().then(function(game){
                    doneFunc(game);
                }.bind(this));
            }.bind(this));
        }.bind(this));


    },
    initPlayer: function(store, playerName, doneFunc) {
        store.createRecord('player', {
            name: playerName
        }).save().then(function(player){
            this.set('player', player);
            doneFunc(player);
        }.bind(this));
    },
    joinGame: function(store, game, doneFunc) {
        if ( this.player == null || game == null) {
            doneFunc();
            return;
        }

        this.set('game', game);

        this.player.set('game', game);
        this.player.save().then(function(){
            this.initSocket(game.get('id'), function(){
                this.sendSocket({
                    name: "joined",
                    data: {
                        playerId: this.player.get('id')
                    }
                });
            }.bind(this));
            doneFunc(game);
        }.bind(this));
    },
    sendSocket: function(msg) {
        if ( !this.get('socketInitialized') )
        {
            this.initSocket(this.sendSocket.bind(this, msg));
        }

        var socket = this.get('socket');

        if (this.get('socketService').websocketIsNotClosed(socket)) {
            socket.send(JSON.stringify(msg));
        } else {
            socket.reconnect();
            socket.on('open', function(){
                socket.send(JSON.stringify(msg));
                socket.off('open', this);
            });
        }
    },
    setGeoPosition: function(coordinates){
        var game = this.get('game');
        game.set('latitude', coordinates.latitude);
        game.set('longitude', coordinates.longitude);

        game.save().then(function(/*game*/){
            this.sendSocket({
                name: "created",
                data: {
                    latitude: coordinates.latitude,
                    longitude:  coordinates.longitude
                }
            });
        }.bind(this));
    },
    reset: function() {
        this.set('game', null);
        this.set('player', null);
    },
    reloadGame: function(gameGetter) {
        if ( this.get('game') ) {
            return true;
        }

        var gameId = this.get('cache.gameId');
        if ( gameId ) {
            var p = gameGetter(gameId);
            this.set('game', p);
            return true;
        } else {
            return false;
        }
    },
    reloadPlayer: function(playerGetter) {
        if ( this.get('player') ) {
            return true;
        }

        var playerId = this.get('cache.playerId');
        if ( playerId ) {
            this.set('player', playerGetter(playerId));
            return true;
        } else {
            return false;
        }
    },
    gameChanged: function(){
        var game = this.get('game');
        if ( game ) {
            this.set('cache.gameId', game.get('id'));
        } else {
            this.set('cache.gameId', null);
        }
    }.observes('game'),
    playerChanged: function(){
        var player = this.get('player');
        if ( player ) {
            this.set('cache.playerId', player.get('id'));
        } else {
            this.set('cache.playerId', null);
        }

    }.observes('player')
});
