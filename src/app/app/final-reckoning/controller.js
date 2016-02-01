import Ember from 'ember';

export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    socket: null,
    accuser: null,
    init: function() {
        var gs = this.get('gameState');
        
        gs.reloadPlayer((playerId) => {
            return this.store.findRecord('player', playerId);
        }).then(
            () => {}, 
            () => {
                this.transitionToRoute('index');
            }
        );

        gs.reloadGame((gameId) => {
            return this.store.findRecord('game', gameId);
        }).then(
            (game) => {
                var id = game.get('id');
                var sock = this.container.lookup('objects:gameSocket').create({gameId: id});

                sock.on('nominated', (data) => {
                    this.set('accuser', this.store.findRecord('player', data.playerId));
                });

                sock.on('accused', (data) => {
                    var accusation = data.accusation;
                    this.transitionToRoute('vote', accusation);
                });

                this.set('socket', sock);

                if ( game.get('victoryType') == 'default' ) {
                    this.transitionToRoute('results', game);
                }
            }, 
            (reason) => {
                console.log('Error: ' + reason);
                this.transitionToRoute('index');
            }
        );
    },
    iAmAccuser: Ember.computed('gameState.player.id', 'accuser.id', function() {
        var playerId = this.get('gameState.player.id');
        var accuserId = this.get('accuser.id');
        
        return playerId && accuserId && accuserId === playerId;
    }),
    actions: {
        nominatePlayer: function(player) {
            this.get('socket').writeSocket({
                name: 'nominated',
                data: {
                    playerId: player.get('id')
                }
            });
        },
        accusePlayer:function(player){
            var gs = this.get('gameState');
            var sock = this.get('socket');

            gs.accuse(this.get('store'), player).then(
                (accusation) => {
                    sock.writeSocket({
                        name: 'accused',
                        data: {
                            accusation: accusation.get('id')
                        }
                    });

                    gs.vote(this.get('store'), accusation, true).then(
                        (/*acc*/) => {
                            sock.writeSocket({
                            name: 'voted',
                            data: {
                                accusation: accusation.get('id')
                            }
                        });
                    });

                    this.transitionToRoute('vote', accusation);
            },
            (reason) => {
                alert('Could not accuse ' + player.get('name') + ': ' + reason);
            });
        },
    }
});
