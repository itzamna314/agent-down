import Ember from 'ember';

export default Ember.Controller.extend({
    gameState: Ember.inject.service('game-state'),
    socketService: Ember.inject.service('websockets'),
    socket: null,
    init: function(){
        this._super.apply(this, arguments);
        var socket = this.get('socketService').socketFor('ws://localhost:8080/ws/join');

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

            var self = this;

            gameState.joinGame(this.store, game, (function(game) {
                if (!game) { self.transitionToRoute('index'); }
                self.get('socket').close();
                self.transitionToRoute('create', game);
            }));
        }
    },
    willDestroy() {
        this.get('socketService').closeSocketFor('ws://localhost:7000/');
    }
});
