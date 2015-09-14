import Ember from 'ember';

import ENV from 'agent-down/config/environment';
import Storage from 'agent-down/game-state/model';

export default Ember.Service.extend({
    game: null,
    player: null,
    cache: Storage.create(),
    socketService: Ember.inject.service('websockets'),
    socketHost: '',
    socketInitialized: false,
    init: function() {
        this._super.apply(this, arguments);

        if (ENV.environment == 'production') {
            this.set('socketHost', 'ws://agentdown.com/ws/')
        } else {
            this.set('socketHost', 'ws://localhost:8080/ws/')
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
            console.log('socket closed');
        }, this);

        this.set('socketInitialized', true);
    },
    newGame: function(store, creatorName, doneFunc) {
        var game = store.createRecord('game', {
            createdOn: '08/30/2015',
            state: 'awaitingPlayers'
        });

        game.then(function(game) {
            this.set('game', game);
            this.set('cache.gameId', game.get('id'));

            var player = store.createRecord('player', {
                game: game,
                name: creatorName,
                isCreator: true,
                hasAccused: null,
                isSpy: null
            });

            player.save().then(function(player){
                this.set('player', player);
                this.set('cache.playerId', player.get('id'));

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
            this.set('cache.playerId', player.get('id'));
            doneFunc(player);
        }.bind(this));
    },
    joinGame: function(store, game, doneFunc) {
        if ( this.player == null || game == null) {
            doneFunc();
            return;
        }

        this.set('game', game);
        this.set('cache.gameId', game.get('id'));

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
        var game = this.get('game');
        if ( !game ) { return; }

        var socketUrl = this.get('socketHost') + 'create/' + game.get('id');
        var socket = this.get('socketService').socketFor(socketUrl);

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
