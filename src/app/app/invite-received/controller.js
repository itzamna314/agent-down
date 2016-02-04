import Ember from 'ember';

export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    actions: {
        join (){
            this.get('gameState').initPlayer(this.store, this.get('nickname'))
                .then(
                    (player) => {
                        this.resolveGotPlayer(player);
                    }, 
                    (message) => {
                        this.rejectGotPlayer(message);
                    }
                );
        }
    },
    resolveGotPlayer: function(/*player*/){
    	this.get('gameState').joinGame(this.get('model')).then(
            (game) => {
                this.resolveJoinedGame(game);
            },
            () => {
                this.transitionToRoute('index');
            }
        );
    },
    resolveJoinedGame: function(game){
		var sock = this.container.lookup('objects:gameSocket').create({gameId:game.get('id')});
		var obj = {
            name: 'joined',
            data:{
                'playerId':this.get('gameState.player.id')
            }
        };

        sock.writeSocket(obj);
        this.transitionToRoute('create', game);
    },
    rejectGotPlayer(){
    	this.transitionToRoute('index');
    }
});
