import Ember from 'ember';

export default Ember.Service.extend({
    socketHost: null,
    socketService: Ember.inject.service('websockets'),
    init: function() {
        if (ENV.environment === 'production') {
            this.set('socketHost', 'ws://agentdown.com/ws/');
        } else {
            this.set('socketHost', 'ws://localhost:8080/ws/');
        }
    },
    joinSocket: function(incomingGameCb) {
        var socketAddress = this.get('socketHost') + 'join';

        return new Promise(function(resolve, reject) {
            var socket = this.get('socketService').socketFor(socketAddress);

            socket.kill = function() {
                socket.off('close', this);
                socket.close();
            }.bind(this);

            var reconnectsLeft = 5;

            socket.on('open', function () {
                reconnectsLeft = 5;
                resolve(socket);
            }, this);
            socket.on('message', function (event) {
                if (!event.data) {
                    return;
                }

                var d = JSON.parse(event.data);

                incomingGameCb(d);
            }.bind(this), this);
            socket.on('close', function () {
                if (reconnectsLeft > 0) {
                    socket.reconnect();
                    reconnectsLeft--;
                }
            }.bind(this), this);
        }.bind(this));
    },
    createSocket: function(id, handleJoin, handleLeave, handleAbandon){
        var socketAddress = this.get('socketHost') + 'create/' + id;

        return new Promise(function(resolve, reject){
            var socket = this.get('socketService').socketFor(socketAddress);

            var reconnectsLeft = 5;

            socket.kill = function() {
                socket.off('close', this);
                socket.close();
            }.bind(this);

            socket.on('open', function(){
                reconnectsLeft = 5;
                resolve(socket);
            }, this);
            socket.on('message', function(event){
                if ( !event.data ) {
                    return;
                }

                console.log('Got socket message: ' + event.data);

                var d = JSON.parse(event.data);

                switch(d.command){
                    case 'joined':
                        handleJoin(d);
                        break;
                    case 'left':
                        handleLeave(d);
                        break;
                    case 'abandoned':
                        handleAbandon(d);
                        break;
                }
            }, this);
            socket.on('close', function() {
                if ( reconnectsLeft > 0 ) {
                    socket.reconnect();
                    reconnectsLeft--;
                }
            }, this);
        }.bind(this));
    }
});
