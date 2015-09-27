import Ember from 'ember';
import _ from 'lodash/lodash';

import ENV from 'agent-down/config/environment';
import Cache from 'agent-down/game-state/model';

var socketOpenCallbacks = [];

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
    prepareSocket: function(id, onOpen){
        if ( this.get('socketInitialized') ) {
            if ( onOpen ) { onOpen(); }
            return;
        }

        if (onOpen ) {
            socketOpenCallbacks.push(onOpen);
        }

        var socketUrl = this.get('socketHost') + 'create/' + id;

        if ( !this.get('socket') ) {
            var socket = this.get('socketService').socketFor(socketUrl);
            this.set('socket', socket);

            var reconnectsLeft = 5;

            socket.on('open', function(){
                this.set('socketInitialized', true);

                _.each(socketOpenCallbacks, function(cb) {
                    cb && cb();
                });

                reconnectsLeft = 5;
            }, this);
            socket.on('message', function(event){
                if ( !event.data ) {
                    return;
                }

                console.log('Got socket message: ' + event.data);

                var d = JSON.parse(event.data);

                switch(d.command){
                    case 'joined':
                    case 'left':
                        var g = this.get('game');
                        if ( g ) { g.reload(); }
                        break;
                    case 'abandoned':
                        this.reset();
                        this.transitionToRoute('index');
                        break;
                }
            }, this);
            socket.on('close', function() {
                if ( reconnectsLeft > 0 ) {
                    socket.reconnect();
                    reconnectsLeft--;
                }
            }, this);
        }
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

                this.prepareSocket(game.get('id'));

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
            this.prepareSocket(game.get('id'), function(){
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
        console.log('Sending socket: ' + JSON.stringify(msg));

        if ( !this.get('socketInitialized') )
        {
            if ( this.get('game') ) {
                this.prepareSocket(this.get('game.id'), this.sendSocket.bind(this, msg));
            }
            else {
                console.log('Failed to send message: ' + JSON.stringify(msg));
            }

            return;
        }

        var socket = this.get('socket');

        if ( !socket )
        {
            console.log('Failed to send to message - no socket: ' + JSON.stringify(msg));
            return;
        }

        if (this.get('socketService').websocketIsNotClosed(socket)) {
            socket.send(JSON.stringify(msg));
        } else {
            socket.reconnect();
            socket.on('open', function(){
                socket.send(JSON.stringify(msg));
                socket.off('open', this);
            }.bind(this), this);
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
    reset: function(resetPlayer) {
        var p = this.get('player');
        var g = this.get('game');

        if ( g ) {
            if (p && g.get('creator.id') !== p.get('id')) {
                g.set('players', g.get('players').filter(function (pl) {
                    return pl.id !== p.id;
                }));
                g.save();
            } else {
                g.destroyRecord().then(this.sendSocket.bind(this, {name:'abandoned', data: {}}));
            }
        }

        this.set('game', null);

        if ( p && resetPlayer) {
            p.destroyRecord();
            this.set('player', null);
        }
        else if (p && p.get('game') != null) {
            p.set('game', null);
            p.save().then(this.sendSocket.bind(this, {name:'left', data: {playerId: p.get('id')}}));
        }
        else {
            this.set('player', null);
        }
    },
    reloadGame: function(gameGetter) {
        if ( this.get('game') ) {
            return true;
        }

        var gameId = this.get('cache.gameId');
        if ( gameId ) {
            gameGetter(gameId).then(function(game) {
                this.set('game', game);
            }.bind(this));

            return true;
        }
        else {
            return false;
        }
    },
    reloadPlayer: function(playerGetter) {
        if ( this.get('player') ) {
            return true;
        }

        var playerId = this.get('cache.playerId');
        if ( playerId ) {
            playerGetter(playerId).then(function(player) {
                this.set('player', player);
            }.bind(this));

            return true;
        }
        else {
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
            console.log('Saving player ' + player.get('id'));
            this.set('cache.playerId', player.get('id'));
        } else {
            console.log('Saving no player');
            this.set('cache.playerId', null);
        }

    }.observes('player'),
    willDestroy() {
        var socketAddress = this.get('socketHost') + 'join';
        this.get('socket').off('close');
        this.get('socketService').closeSocketFor(socketAddress);

        socketAddress = this.get('socketHost') + 'create';
        this.get('socket').off('close');
        this.get('socketService').closeSocketFor(socketAddress);
    }
});
