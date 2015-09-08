import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['gameState'],
    socketService: Ember.inject.service('websockets'),
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
    },
    actions:{
        joinGame: function(/*game*/){
            var gameState = this.get('controllers.gameState');

            if ( !gameState || !gameState.player ) {
                this.transitionToRoute('index');
            }

            //var self = this;

            /*gameState.joinGame(game, (function(game) {
                self.transitionToRoute('create', game);
            }));*/
        }
    },
    willDestroy() {
        this.get('socketService').closeSocketFor('ws://localhost:7000/');
    }
});
