import Ember from 'ember';
import GeoLocationMixin from 'agent-down/mixins/geolocation-mixin';

export default Ember.Controller.extend(GeoLocationMixin, {
    needs: ["gameState"],
    socketService: Ember.inject.service('websockets'),
    actions: {
        createGame: function() {
            this.get('geolocation').stop();

            this.transitionToRoute('active');
        }
    },
    toggleGeoPosition: Ember.observer('useGeoPosition', function(){
        if (this.get('useGeoPosition') ) {
            this.get('geolocation').start();

            this.get('geolocation').getGeoposition().then(function(pos) {
                var gameState = this.get('controllers.gameState');
                if (!gameState) {
                    this.transitionToRoute('index');
                }
                var game = gameState.game;
                game.latitude = pos.coords.latitude;
                game.longitude = pos.coords.longitude;

                game.save();

                var socket = this.get('socketService').socketFor('ws://localhost:8080/ws/create/' + game.id);
                var msg = {
                    name: "created",
                    data: {
                        latitude: game.latitude,
                        longitude: game.longitude
                    }
                };

                socket.on('open', function(){
                    console.log('socket opened');
                    socket.send(JSON.stringify(msg));
                },this);

            }.bind(this));
        }
        else
        {
        }
    })
});
