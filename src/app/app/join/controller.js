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
        var success = gs.reloadPlayer(function(playerId) {
            return this.get('store').findRecord('player', playerId);
        }.bind(this));

        if ( !success ) {
            this.transitionToRoute('index');
            console.log('Failed to reload player');
            return;
        }

        var sock = this.container.lookup('objects:joinSocket').create();

        sock.on('incomingGame', function(joinData){
            var geoPos = this.get('model.geoPosition');

            var distance = dist(joinData.latitude, joinData.longitude, geoPos.latitude, geoPos.longitude);

            console.log("Incoming game " + distance + " miles away");

            if (distance < threshold) {
                this.send('updateGames');
            }
        }.bind(this));

        this.set('socket', sock);
    },
    actions:{
        joinGame: function(game){
            var gameState = this.get('gameState');

            gameState.joinGame(game).then(function(game) {
                var sock = this.container.lookup('objects:gameSocket').create({gameId:game.get('id')});
                sock.writeSocket({
                    name: 'joined',
                    data:{
                        'playerId':gameState.get('player.id')
                    }
                });
                this.transitionToRoute('create', game);
            }.bind(this), function(){
                this.transitionToRoute('index');
            }.bind(this));
        },
        reset (){
            var gs = this.get('gameState');
            gs.reset(false);
        }
    },
    willDestroy() {
        this.get('socket').kill();
    }
});
