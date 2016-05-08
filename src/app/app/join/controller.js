import Ember from 'ember';


export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    init: function(){
        this._super.apply(this, arguments);
        var gs = this.get('gameState');
        gs.reloadPlayer(
            (playerId) => {
                return this.get('store').findRecord('player', playerId);
            }
        ).then(
            () => {},
            () => {
                this.transitionToRoute('index');
                console.log('Failed to reload player');
            }
        );
    },
    actions:{
        joinGame: function(game) {
            var gameState = this.get('gameState');

            gameState.joinGame(game).then(
                (game) => {
                    var sock = this.container.lookup('objects:gameSocket').create({gameId:game.get('id')});
                    sock.writeSocket({
                        name: 'joined',
                        data:{
                            'playerId':gameState.get('player.id')
                        }
                    });
                    
                    this.transitionToRoute('create', game);
                }, 
                () => {
                    this.transitionToRoute('index');
                }
            );
        },
        reset (){
            var gs = this.get('gameState');
            gs.reset(false).then(
                (obj) => {
                    if ( obj ) {
                        var sock = this.container.lookup('objects:gameSocket').create({gameId: obj.gameId});
                        sock.writeSocket(obj.event);
                    }
                }
            );
        }
    },
    willDestroy() {
        this.get('socket').kill();
    }
});
