import Ember from 'ember';
import GeoLocationMixin from 'agent-down/mixins/geolocation-mixin';

export default Ember.Controller.extend(GeoLocationMixin, {
    needs: ["gameState"],
    actions: {
        createGame: function() {
            this.get('geolocation').stop();

            this.transitionToRoute('active');
        }
    },
    toggleGeoPosition: Ember.observer('useGeoPosition', function(){
        if (this.get('useGeoPosition') ) {
            this.get('geolocation').start();

            this.get('geolocation').getGeoposition().then(function(geoposition) {
                var gameState = this.get('controllers.gameState');
                if (!gameState) {
                    this.transitionToRoute('index');
                }
                var game = gameState.game;
                game.latitude = geoposition.coords.latitude;
                game.longitude = geoposition.coords.longitude;

                game.save();
            }.bind(this));
        }
    })
});
