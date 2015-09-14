import Ember from 'ember';

export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    socketService: Ember.inject.service('websockets'),
    socket: null,
    init: function(){
        this._super.apply(this, arguments);
        var gs = this.get('gameState');
        var socketAddress = gs.get('socketHost') + 'join';

        var socket = this.get('socketService').socketFor(socketAddress);

        socket.on('open', function(){
            console.log('socket opened');
        }, this);
        socket.on('message', function(event){
            console.log(event);
            console.log(JSON.stringify(event.data));
        }, this);
        socket.on('close', function() {
            console.log('socket closed');
        }, this);

        this.set('socket', socket);
    },
    actions:{
        joinGame: function(game){
            var gameState = this.get('gameState');

            if ( !gameState || !gameState.player ) {
                this.transitionToRoute('index');
            }

            gameState.joinGame(this.store, game, (function(game) {
                if (!game) { this.transitionToRoute('index'); }
                this.get('socket').close();
                this.transitionToRoute('create', game);
            }).bind(this));
        }
    },
    willDestroy() {
        this.get('socketService').closeSocketFor('ws://localhost:7000/');
    }
});
