import Ember from 'ember';

import Cache from 'agent-down/game-state/model';

export default Ember.Service.extend({
    game: null,
    player: null,
    cache: Cache.create(),
    init: function() {
        this._super.apply(this, arguments);
    },
    newGame: function(store, creatorName) {
        return new Ember.RSVP.Promise(function(resolve, reject){
            var d = new Date();

            var game = store.createRecord('game', {
                createdOn: d.getMonth() + '/' + d.getDate() + '/' + d.getYear(),
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

                    game.set('creator', player);
                    game.save().then(function(game){
                        resolve(game, player);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },
    initPlayer: function(store, playerName) {
        return new Ember.RSVP.Promise(function(resolve, reject){
            store.createRecord('player', {
                name: playerName
            }).save().then(function(player){
                this.set('player', player);
                resolve(player);
            }.bind(this), function(reason) {
                reject(reason);
            });
        }.bind(this));
    },
    joinGame: function(game) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            if ( this.player == null || game == null) {
                reject();
            }

            this.set('game', game);

            this.player.set('game', game);
            this.player.save().then(function(/*player*/){
                resolve(game);
            }.bind(this));
        }.bind(this));
    },
    setGeoPosition: function(coordinates){
        var game = this.get('game');
        game.set('latitude', coordinates.latitude);
        game.set('longitude', coordinates.longitude);

        return game.save();
    },
    reset: function(resetPlayer) {
        return new Ember.RSVP.Promise(function(resolve, reject){
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
                            resolve('left', {'playerId': p.get('id')});
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
        return new Ember.RSVP.Promise(function(resolve, reject){
            if ( this.get('game') ) {
                resolve(this.get('game'));
            }

            var gameId = this.get('cache.gameId');
            if ( gameId ) {
                gameGetter(gameId).then(function(game) {
                    this.set('game', game);
                    resolve(game);
                }.bind(this));
            }
            else {
                reject('Could not find game');
            }
        }.bind(this));
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
