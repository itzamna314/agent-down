import Ember from 'ember';

export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    actions: {
        create (){
            var nick = this.get('nickname');

            if ( !nick ) {
                alert('Please enter a codename');
                return;
            }

            this.get('gameState').newGame(this.store, nick).then(
                (game) => {
                    this.transitionToRoute('create', game);
                }
            );
        },
        join (){
            var nick = this.get('nickname');

            if ( !nick ) {
                alert('Please enter a codename');
                return;
            }

            this.get('gameState').initPlayer(this.store, nick).then(
                () => {
                    this.transitionToRoute('join');
                }
            );
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
