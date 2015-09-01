import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['gameState'],
    actions:{
        joinGame: function(game){
            var gameState = this.get('controllers.gameState');

            if ( !gameState || !gameState.player ) {
                this.transitionToRoute('index');
            }

            var self = this;

            gameState.joinGame(game, (function(game) {
                self.transitionToRoute('create', game);
            }));
        }
    }
});
