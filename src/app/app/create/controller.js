import Ember from 'ember';
import GeoLocationMixin from 'agent-down/mixins/geolocation-mixin';

export default Ember.Controller.extend(GeoLocationMixin, {
    gameState: Ember.inject.service('game-state'),
    socket: Ember.inject.service('game-socket'),
    init: function() {
        var gs = this.get('gameState');

        gs.reloadPlayer(
            (playerId) => { return this.store.findRecord('player', playerId); }).then(
                () => {}, 
                () => { this.transitionToRoute('index'); }
            );

        gs.reloadGame((gameId) => { return this.store.findRecord('game', gameId); }).then(
            (game) => {
                var id = game.get('id');
                var sock = this.container.lookup('objects:gameSocket').create({gameId: id});

                sock.on('joined', this, () => {
                    console.log('joined');
                    this.get('model').reload();
                });

                sock.on('left', this, () => {
                    console.log('left');
                    this.get('model').reload();
                });

                sock.on('kicked', this, (o) => {
                    console.log('kicked');
                    if ( gs.get('player.id') === o.playerId ) {
                        this.transitionToRoute('join');
                    }
                });

                sock.on('abandoned', this, () => {
                    var p = gs.get('player');
                    if ( p != null && !p.get('isCreator') ) {
                        console.log('abandoned');
                        this.transitionToRoute('join');
                        this.get('gameState').reset(false);
                    }
                });

                sock.on('started', this, () => {
                    console.log('started');
                    gs.get('player').reload();
                    gs.get('game').reload();
                    this.transitionToRoute('active');
                });

                this.set('socket', sock);
            }, 
            (reason) => {
                console.log('Error: ' + reason);
                this.transitionToRoute('index');
            }
        );
    },
    actions: {
        startGame: function() {
            var gs = this.get('gameState');
            var sock = this.get('socket');

            gs.startGame().then(function(g){
                sock.writeSocket({
                    name: 'started',
                    data: {
                        gameId: g.get('id')
                    }
                }).then(function(){
                    this.transitionToRoute('active');
                }.bind(this));
            }.bind(this));
        },
        kickPlayer: function(player) {
            var sock = this.get('socket');
            var gs = this.get('gameState');

            gs.kickPlayer(player).then(function(p){
                sock.writeSocket({
                    name: 'kicked',
                    data: {
                        playerId: p.get('id')
                    }
                });
            });
        },
        back : function() {
            var gs = this.get('gameState');
            gs.reset(false).then(function(obj){
                var sock = this.get('socket');

                sock.writeSocket(obj.event).then(function(){
                    sock.kill();
                    this.transitionToRoute('join');
                }.bind(this));
            }.bind(this));
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
    isCreator: Ember.computed('gameState.player', function(){
        return this.get('gameState.player.isCreator');
    }),
    origin: Ember.computed('document.location.origin', function(){
        return document.location.origin;
    }),
    willDestroy: function(){
        this.get('geolocation').stop();
    }
});
