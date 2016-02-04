import Ember from 'ember';

export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    actions: {
        create (){
            var self = this;
            this.get('gameState').newGame(this.store, this.get('nickname')).then(function(game){
                self.transitionToRoute('create', game);
            });
        },
        join (){
            var self = this;
            this.get('gameState').initPlayer(this.store, this.get('nickname')).then(function(){
                self.transitionToRoute('join');
            });
        },
        reset (){
            var gs = this.get('gameState');
            gs.reset(true).then(obj => {
                if ( obj ) {
                    var sock = this.container.lookup('objects:gameSocket').create({gameId: obj.gameId});
                    sock.writeSocket(obj.event);
                }
            });
        }
    }
});
