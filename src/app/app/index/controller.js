import Ember from 'ember';

export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    actions: {
        create (){
            var self = this;
            this.get('gameState').newGame(this.store, this.get('nickname'), (function(game){
                self.transitionToRoute('create', game);
            }));
        },
        join (){
            var self = this;
            this.get('gameState').initPlayer(this.get('nickname'), (function(){
                self.transitionToRoute('join');
            }));
        }
    }
});
