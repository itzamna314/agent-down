import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['gameState'],
    actions:{
        joinGame (game){
            var gameState = this.get('controllers.gameState');

            if ( !gameState || !gameState.player ) {
                this.transition.ToRoute('index');
            }

            var self = this;

            gameState.joinGame(game, (function(game) {
                self.transition.ToRoute('create', game);
            }));
        }
    }
});
