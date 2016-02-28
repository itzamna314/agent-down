import Ember from 'ember';

export default Ember.Controller.extend({
	gameState: Ember.inject.service('game-state'),
    socket: null,
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

            this.set('socket', sock);

            }, 
            (reason) => {
                console.log('Error: ' + reason);
                this.transitionToRoute('index');
            }
        );
    },
    actions: {
        playAgain() {
            this.transitionToRoute('index');
        }
    }
});
