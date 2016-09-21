import Ember from 'ember';


export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    joinCode: null,
    errorMsg: null,
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
    invalidCode() {
        var code = this.get('joinCode');
        this.set('joinCode', '');
        this.set('errorMsg', `Invalid join code ${code}`);
    },
    missingCode() {
        this.set('errorMsg', `Please enter a join code.  Ask anyone in the game for the code.`);
    },
    actions:{
        joinGame: function() {
            var code = this.get('joinCode');
            if (!code) {
                this.missingCode();
                return;
            }
            var gameState = this.get('gameState');

            this.get('store').query('game', {'joinCode': code}).then(
                (games) => {
                    if (games.get('length') != 1) {
                        this.invalidCode();
                        return;
                    }
                    var game = games.objectAtContent(0);
                    var sock = this.container.lookup('objects:gameSocket').create({gameId:game.get('id')});
                    gameState.joinGame(game).then(
                        (game) => {
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
                () => {
                    this.invalidCode();
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
