import Ember from 'ember';
import GeoLocationMixin from 'agent-down/mixins/geolocation-mixin';

export default Ember.Controller.extend(GeoLocationMixin, {
    gameState: Ember.inject.service('game-state'),
    init: function() {
        var gs = this.get('gameState');

        if ( !gs.reloadPlayer(function(playerId){
            return this.store.findRecord('player', playerId);
        }.bind(this))) {
            this.transitionToRoute('index');
            return;
        }

        if ( !gs.reloadGame(function(gameId){
                return this.store.findRecord('game', gameId);
        }.bind(this))) {
            this.transitionToRoute('index');
            return;
        }
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

                gameState.setGeoPosition(pos.coords);

            }.bind(this));
        }
        else
        {
        }
    })
});
