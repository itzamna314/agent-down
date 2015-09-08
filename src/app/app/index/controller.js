import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['gameState'],
    actions: {
        create (){
            var self = this;
            this.get('controllers.gameState').newGame(this.get('nickname'), (function(game){
                self.transitionToRoute('create', game);
            }));
        },
        join (){
            var self = this;
            this.get('controllers.gameState').initPlayer(this.get('nickname'), (function(){
                self.transitionToRoute('join');
            }));
        }
    }
});
