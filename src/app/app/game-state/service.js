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
        return new Ember.RSVP.Promise(function(resolve /*, reject*/){
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
    kickPlayer: function(player) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            if (player == null || this.game == null ) {
                reject();
            }

            player.set('game', null);

            player.save().then(function(p){
                resolve(p);
            }, 
            function(reason){
                reject(reason);
            });
        }.bind(this));
    },
    joinGame: function(game) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            if ( this.player == null || game == null) {
                reject();
            }

            this.set('game', game);

            this.player.set('game', game);
            this.player.save().then((/*player*/) => resolve(game));
        });
    },
    startGame: function() {
        var game = this.get('game');
        game.set('state', 'inProgress');

        return new Ember.RSVP.Promise( function(resolve ,reject) {
            game.save().then(function(g){
                resolve(g);
            }, function(reason){
                reject(reason);
            });
        }.bind(this));
    },
    accuse: function(store, accused){
        return new Ember.RSVP.Promise(function(resolve, reject){
            store.createRecord('accusation', {
                game: this.get('game'),
                accuser: this.get('player'),
                accused: accused
            }).save().then(function(accusation){
                this.get('player').reload().then(function(){
                    this.set('player.accusationMade', accusation);
                    resolve(accusation);
                }.bind(this), function(reason){ reject(reason); } );
            }.bind(this),
            function(reason){
                reject(reason);
            });
        }.bind(this));
    },
    vote: function(store, accusation, isGuilty) {
        return store.createRecord('vote', {
                accusation: accusation,
                player: this.get('player'),
                accuse: isGuilty
            }).save();
    },
    reset: function(resetPlayer) {
        return new Ember.RSVP.Promise(function(resolve /*, reject*/){
            var p = this.get('player');
            var g = this.get('game');

            if ( g ) {
                if ( p ) {
                    if (p.get('isCreator')) {
                        g.destroyRecord().then(function () {
                            this.set('player', null);
                            this.set('game', null);
                            resolve({gameId: g.get('id'), event: {name: 'abandoned', data: { }}});
                        }.bind(this));
                    }
                    else {
                        p.set('game', null);
                        p.save().then(function(){
                            this.set('game', null);
                            resolve({gameId: g.get('id'), event: {name: 'left', data: {'playerId': p.get('id')}}});
                        }.bind(this));
                    }

                    if ( resetPlayer ) {
                        this.set('player', null);
                    }

                    this.set('game', null);
                    return;
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

            if ( !g || !p ) {
                resolve();
            }
        }.bind(this));
    },
    reloadGame: function(gameGetter) {
        return new Ember.RSVP.Promise(function(resolve, reject){
            if ( this.get('game') ) {
                resolve(this.get('game'));
                return;
            }

            var gameId = this.get('cache.gameId');
            if ( gameId ) {
                gameGetter(gameId).then(
                    (game) => {
                        this.set('game', game);
                        resolve(game);
                    },
                    (reason) => {
                        this.set('cache.gameId', null);
                        reject(reason);
                    }
                );
            }
            else {
                reject('Could not find game');
            }
        }.bind(this));
    },
    reloadPlayer: function(playerGetter) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            var p = this.get('player');
            if ( p ) {
                resolve(p);
                return;
            }

            var playerId = this.get('cache.playerId');
            if ( playerId ) {
                playerGetter(playerId).then(
                    (player) => {
                        this.set('player', player);
                        resolve(player);
                    },
                    (reason) => {
                        this.set('cache.playerId', null);
                        reject(reason);
                    }
                );
            }
            else {
                reject();
            }
        });
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
