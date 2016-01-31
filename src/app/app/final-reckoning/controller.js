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
                    this.set('accuser', this.store.findRecord('player', data.player));
                });

                this.set('socket', sock);
            }, 
            (reason) => {
                console.log('Error: ' + reason);
                this.transitionToRoute('index');
            }
        );
    },
    iAmAccuser: Ember.computed('player.id', 'accuser.id', function() {
        return this.get('player.id') === this.get('accuser.id');
    }),
    actions: {
        nominatePlayer: function(player) {
            this.get('socket').writeSocket({
                name: 'nominated',
                data: {
                    player: player.get('id')
                }
            });
        }
    }
});
