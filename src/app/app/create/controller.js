import Ember from 'ember';
import GeoLocationMixin from 'agent-down/mixins/geolocation-mixin';

export default Ember.Controller.extend(GeoLocationMixin, {
    gameState: Ember.inject.service('game-state'),
    socket: null,
    init: function() {
        var gs = this.get('gameState');

        gs.reloadPlayer(function(playerId){
            return this.store.findRecord('player', playerId);
        }.bind(this)).then(function(){}, function(){
            this.transitionToRoute('index');
        }.bind(this));

        gs.reloadGame(function(gameId){
                return this.store.findRecord('game', gameId);
        }.bind(this)).then(function(game){
            var id = game.get('id');
            var sock = this.container.lookup('objects:gameSocket').create({gameId: id});

            sock.on('joined', this, function() {
                console.log('joined');
                this.get('model').reload();
            });

            sock.on('left', this, function() {
                console.log('left');
                this.get('model').reload();
            });

            sock.on('abandoned', this, function() {
                var p = gs.get('player');
                if ( p != null && !p.get('isCreator') ) {
                    console.log('abandoned');
                    this.transitionToRoute('join');
                    this.get('gameState').reset(false);
                }
            });

            this.set('socket', sock);
        }.bind(this), function(reason) {
            console.log('Error: ' + reason);
            this.transitionToRoute('index');
        }.bind(this));
    },
    actions: {
        createGame: function() {

            /*this.get('geolocation').stop();

            this.transitionToRoute('active');*/
        },
        back : function() {
            var sock = this.get('socket');
            if ( sock ) {
                sock.kill();
            }

            this.transitionToRoute('join');
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
                    this.get('socket').writeSocket({
                        name: "created",
                        data: {
                            latitude: pos.coords.latitude,
                            longitude:  pos.coords.longitude
                        }
                    });
                }.bind(this));

            }.bind(this));
        }
    }),
    isCreator: Ember.computed('gameState', function(){
        return this.get('gameState.player.isCreator');
    }),
    willDestroy: function(){
        this.get('geolocation').stop();
    }
});
