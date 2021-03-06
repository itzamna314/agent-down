import Ember from 'ember';

export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    socket: Ember.inject.service('game-socket'),
    init: function() {
        var gs = this.get('gameState');

        gs.reloadPlayer(
            (playerId) => { return this.store.findRecord('player', playerId); })
        .then(
                () => {}, 
                () => { this.transitionToRoute('index'); }
            );

        gs.reloadGame(
            (gameId) => { return this.store.findRecord('game', gameId); })
        .then(
            (game) => {
                var id = game.get('id');
                var sock = this.container.lookup('objects:gameSocket')
                    .create({gameId: id});

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
                    if ( parseInt(gs.get('player.id')) === o.playerId ) {
                        this.transitionToRoute('join');
                    } else {
                        this.get('model').reload();
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
    useGeoPosition: Ember.computed(
        'gameState', 
        'gameState.game', 
        'gameState.game.latitude', 
        'gameState.game.longitude',
        function() {
            var g = this.get('gameState.game');
            return g.get('latitude') && g.get('longitude');
        }
    ),
    actions: {
        toggleGeoPosition: function(){
            if (!this.get('useGeoPosition') ) {
                this.get('geoPosition').getGeoPosition().then(
                    (pos) => {
                        var gameState = this.get('gameState');
                        if (!gameState) {
                            this.transitionToRoute('index');
                        }

                        gameState.setGeoPosition(pos).then(
                            () => {
                                this.get('socket').writeSocket({
                                    name: "created",
                                    data: {
                                        latitude: pos.latitude,
                                        longitude:  pos.longitude
                                    }
                                });
                            }
                        );
                    },
                    (/*reason*/) => {
                        alert('Failed to get geo position!  Please enable location or send invitations');
                        this.set('useGeoPosition', false);
                    }
                );
            } else {
                var g = this.get('gameState.game');

                if (!g) {
                    this.transitionToRoute('index');
                }

                g.set('latitude', null);
                g.set('longitude', null);
                g.save();
            }
        },
        startGame: function() {
            var gs = this.get('gameState');
            var sock = this.get('socket');

            gs.startGame().then(
                (g) => {
                   sock.writeSocket({
                       name: 'started',
                       data: {
                           gameId: g.get('id')
                       }
                   });

                   this.transitionToRoute('active');
                }
            );
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
            gs.reset(false).then(
                (obj) => {
                    var sock = this.get('socket');
                    sock.writeSocket(obj.event);
                    this.transitionToRoute('join');
                }, () => {
                    this.transitionToRoute('index');
                }
            );
        }
    },
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
