import Ember from 'ember';


export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    geoPosition: Ember.inject.service('geo-location'),
    socket: null,
    coordinates: null,
    init: function(){
        this._super.apply(this, arguments);
        var gs = this.get('gameState');
        gs.reloadPlayer(
            (playerId) => {
                return this.get('store').findRecord('player', playerId);
            }
        ).then(
            () => {},
            () => {
                this.transitionToRoute('index');
                console.log('Failed to reload player');
            }
        );

        this.get('geoPosition').getGeoPosition().then(
            (pos) => {
                this.set('coordinates', pos);
            },
            (/*reason*/) => {
                alert('Could not acquire geo position.  Make sure location is enabled, or request an invite');
                this.transitionToRoute('index');
            }
        );

        var sock = this.container.lookup('objects:joinSocket').create();

        sock.on('incomingGame', 
            (joinData) => {
                this.reloadGames();
            }
        );

        this.set('socket', sock);
    },
    nearbyGames: Ember.computed('model', 'coordinates', function() {
        var games = this.get('model');
        var currentPosition = this.get('coordinates');
        if ( !games || !currentPosition ) {
            return null;
        }
        
        return games.filter(
            (item) => {
                let lat = item.get('latitude');
                let lon = item.get('longitude');

                if ( !lat || !lon ) { return false; }

                return this.get('geoPosition').isNearby(currentPosition, {
                    latitude: lat,
                    longitude: lon
                });
        }
        )
    }),
    gamesLoaded: Ember.computed('model', 'coordinates', function() {
        var g = this.get('nearbyGames');
        return g !== null && g !== undefined;
    }),
    reloadGames () {
        this.store.query('game', {'state':'awaitingPlayers'}).then(
            (games) => {
                this.set('model', games);
            },
            (reason) => {
                alert('failed to reload games: ' + reason);
            }
        );
    },
    actions:{
        joinGame: function(game) {
            var gameState = this.get('gameState');

            gameState.joinGame(game).then(
                (game) => {
                    var sock = this.container.lookup('objects:gameSocket').create({gameId:game.get('id')});
                    sock.writeSocket({
                        name: 'joined',
                        data:{
                            'playerId':gameState.get('player.id')
                        }
                    });
                    
                    this.transitionToRoute('create', game);
                }, 
                () => {
                    this.transitionToRoute('index');
                }
            );
        },
        reset (){
            var gs = this.get('gameState');
            gs.reset(false).then(
                (obj) => {
                    if ( obj ) {
                        var sock = this.container.lookup('objects:gameSocket').create({gameId: obj.gameId});
                        sock.writeSocket(obj.event);
                    }
                }
            );
        }
    },
    willDestroy() {
        this.get('socket').kill();
    }
});
