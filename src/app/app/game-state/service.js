import Ember from 'ember';
import _ from 'lodash/lodash';

import ENV from 'agent-down/config/environment';
import Cache from 'agent-down/game-state/model';

export default Ember.Service.extend({
    game: null,
    player: null,
    cache: Cache.create(),
    init: function() {
        this._super.apply(this, arguments);
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
    setGeoPosition: function(coordinates){
        var game = this.get('game');
        game.set('latitude', coordinates.latitude);
        game.set('longitude', coordinates.longitude);

        return game.save();
    },
    reset: function(resetPlayer) {
        return new Promise(function(resolve, reject){
            var p = this.get('player');
            var g = this.get('game');

            if ( g ) {
                if ( p ) {
                    if (g.get('creator.id') !== p.get('id')) {
                        g.set('players', g.get('players').filter(function (pl) {
                            return pl.id !== p.id;
                        }));
                        g.save();

                        p.set('game', null);
                        p.save().then(function(){
                            resolve('left', {'playerId': p.get('id')})
                        });
                    } else {
                        g.destroyRecord().then(function () {
                            resolve('abandoned', { });
                        });
                    }
                }
            }

            this.set('game', null);

            if ( p && resetPlayer) {
                p.destroyRecord();
                this.set('player', null);
            }

            if ( !p ) {
                this.set('player', null);
            }

            resolve();
        }.bind(this));
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

    }.observes('player')
});
