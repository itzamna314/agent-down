import Ember from 'ember';
import GeoLocationMixin from 'agent-down/mixins/geolocation-mixin';

export default Ember.Controller.extend(GeoLocationMixin, {
    gameState: Ember.inject.service('game-state'),
    socket: null,
    init: function() {
        var gs = this.get('gameState');

        if ( !gs.reloadPlayer(function(playerId){
            return this.store.findRecord('player', playerId);
        }.bind(this))) {
            this.transitionToRoute('index');
            return;
        }

        gs.reloadGame(function(gameId){
                return this.store.findRecord('game', gameId);
        }.bind(this)).then(function(game){
            var id = game.get('id');
            var sock = this.container.lookup('objects:gameSocket').create({gameId: id});

            sock.on('joined', function() {
                this.get('model').reload();
            }.bind(this));

            sock.on('left', function() {
                this.get('model').reload();
            }.bind(this));

            sock.on('abandoned', function() {
                this.transitionToRoute('join');
                this.get('gameState').reset(false);
            }.bind(this));
        }.bind(this), function(reason) {
            console.log('Error: ' + reason);
            this.transitionToRoute('index');
        }.bind(this));
    },
    actions: {
        createGame: function() {

            /*this.get('geolocation').stop();

            this.transitionToRoute('active');*/
        }
    },
    toggleGeoPosition: Ember.observer('useGeoPosition', function(){
        if (this.get('useGeoPosition') ) {
            this.get('geolocation').start();

            this.get('geolocation').getGeoposition().then(function(pos) {
                var gameState = this.get('gameState');
                if (!gameState) {
                    this.transitionToRoute('index');
                }

                gameState.setGeoPosition(pos.coords).then(function(/*game*/){
                    this.sendSocket({
                        name: "created",
                        data: {
                            latitude: pos.coords.latitude,
                            longitude:  pos.coords.longitude
                        }
                    });
                }.bind(this));

            }.bind(this));
        }
    })
});
