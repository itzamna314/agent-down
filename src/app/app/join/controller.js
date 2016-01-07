import Ember from 'ember';

// Returns in miles
function dist(lat1, lon1, lat2, lon2) {
    var dlon = lon2 - lon1;
    var dlat = lat2 - lat1;
    var a = Math.pow(Math.sin(dlat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2), 2);
    var c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1-a) );
    return 3959 * c;
}

var threshold = 1;

export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    socket: null,
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

        var sock = this.container.lookup('objects:joinSocket').create();

        sock.on('incomingGame', 
                (joinData) => {
                    var geoPos = this.get('model.geoPosition');
                    var distance = dist(joinData.latitude, joinData.longitude, geoPos.latitude, geoPos.longitude);

                    console.log("Incoming game " + distance + " miles away");

                    if (distance < threshold) {
                        this.send('updateGames');
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
                    }).then(
                        () => {
                            this.transitionToRoute('create', game);
                        },
                        () => {
                            console.log('failed to write socket');
                            this.transitionToRoute('create', game);
                        }
                    );
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
                        sock.writeSocket(obj.event).then(
                            () => {
                                console.log('done');
                            }
                        );
                    }
                }
            );
        }
    },
    willDestroy() {
        this.get('socket').kill();
    }
});
