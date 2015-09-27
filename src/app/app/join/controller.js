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
    socketService: Ember.inject.service('websockets'),
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

        var socketAddress = gs.get('socketHost') + 'join';

        var socket = this.get('socketService').socketFor(socketAddress);

        var reconnectsLeft = 5;

        socket.on('open', function(){
            reconnectsLeft = 5;
        }, this);
        socket.on('message', function(event){
            if ( !event.data ) {
                return;
            }

            var d = JSON.parse(event.data);

            var geoPos = this.get('model.geoPosition');

            var distance = dist(d.latitude, d.longitude, geoPos.latitude, geoPos.longitude);

            console.log("Incoming game " + distance + " miles away");

            if (  distance < threshold) {
                this.send('updateGames');
            }
        }.bind(this), this);
        socket.on('close', function(){
            if ( reconnectsLeft > 0 ) {
                socket.reconnect();
                reconnectsLeft--;
            }
        }.bind(this), this);

        this.set('socket', socket);
    },
    actions:{
        joinGame: function(game){
            var gameState = this.get('gameState');

            if ( !gameState || !gameState.get('player') ) {
                this.transitionToRoute('index');
            }

            gameState.joinGame(this.store, game, (function(game) {
                if (!game) { this.transitionToRoute('index'); }
                this.get('socket').close();
                this.transitionToRoute('create', game);
            }).bind(this));
        },
        reset (){
            var gs = this.get('gameState');
            gs.reset(false);
        }
    },
    willDestroy() {
        var gs = this.get('gameState');

        var socketAddress = gs.get('socketHost') + 'join';
        this.get('socket').off('close');
        this.get('socketService').closeSocketFor(socketAddress);
    }
});
