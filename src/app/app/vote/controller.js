import Ember from 'ember';

export default Ember.Controller.extend({
	gameState: Ember.inject.service('game-state'),
    socket: null,
    init: function() {
        var gs = this.get('gameState');

        gs.reloadPlayer(
            (playerId) => {
                return this.store.findRecord('player', playerId);
            }
        ).then(
            () => {},
            () => {
                this.transitionToRoute('index');
            }
        );

        gs.reloadGame(
            (gameId) => {
                return this.store.findRecord('game', gameId);
            }
        ).then(
            (game) => {
                var id = game.get('id');
                var sock = this.container.lookup('objects:gameSocket').create({gameId: id});

                this.set('socket', sock);

                sock.on('voted', 
                    () => {
                        console.log('voted');
                        this.onVoted();
                    }
               );
            }, 
            (reason) => {
                console.log('Error: ' + reason);
                this.transitionToRoute('index');
            }
        );
    },
    vote: function(isGuilty){
        var gs = this.get('gameState');
        var sock = this.get('socket');

        gs.vote(this.get('store'), this.get('model'), isGuilty).then(
            (/*vote*/) => {
                sock.writeSocket({
                    name: 'voted',
                    data: {
                        accusation: this.get('model.id'),
                        accuse: isGuilty
                    }
                });

                this.onVoted();
            },
            (reason) => {
                alert('Could not vote: ' + reason);
            }
        );
    },
    onVoted: function() {
        
        this.get('model').reload().then(
            (accusation) => {
                if ( accusation.get('state') === 'guilty' ) {
                        this.transitionToRoute('results', this.get('gameState.game'));
                    } else if (accusation.get('state') === 'innocent' ) {
                        this.transitionToRoute('active');
                    }
            }
        );
    },
    actions:{
        voteGuilty: function() {
            this.vote(true);
        },
        voteInnocent: function() {
            this.vote(false);
        }
    }
});
