import Ember from 'ember';


export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    geoPosition: Ember.inject.service('geo-location'),
    socket: null,
    coordinates: null,
    nearbyGames: null,
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
                this.set('nearbyGames', this.get('model')
                         .filter(
                            (item) => {
                                let lat = item.get('latitude');
                                let lon = item.get('longitude');

                                if ( !lat || !lon ) { return false; }

                                return this.get('geoPosition').isNearby(pos, {latitude: lat, longitude: lon});
                            }
                         )
                );
            },
            (reason) => {
                alert('Could not acquire geo position.  Make sure location is enabled, or request an invite');
                this.transitionToRoute('index');
            }
        );

        var sock = this.container.lookup('objects:joinSocket').create();

        sock.on('incomingGame', 
            (joinData) => {
                var coords = this.get('coordinates'); 
                if ( !coords ) {
                    this.get('model').reload();
                }

                if (this.get('geoPosition').isNearby(joinData, geoPos) ) {
                    this.get('model').reload();
                }
            }
        );

        this.set('socket', sock);
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
                        sock.writeSocket(obj.event)
                    }
                }
            );
        }
    },
    willDestroy() {
        this.get('socket').kill();
    }
});
