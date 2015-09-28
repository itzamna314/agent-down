import Ember from 'ember';

import ENV from 'agent-down/config/environment';

var svc = Ember.Service.extend({
    socketHost: null,
    socketService: Ember.inject.service('websockets'),
    joinSocket: null,
    createSocket: null,
    init: function() {
        if (ENV.environment === 'production') {
            this.set('socketHost', 'ws://agentdown.com/ws/');
        } else {
            this.set('socketHost', 'ws://localhost:8080/ws/');
        }
    },
    getJoinSocket: function(handlerFn) {
        var socketAddress = this.get('socketHost') + 'join';

        var socket = this.get('joinSocket');

        var reconnectsLeft = 5;

        if (socket != null && this.get('socketService').websocketIsNotClosed(socket))
        {
            return new Ember.RSVP.Promise(function (resolve) {
                resolve(this.get('joinSocket'));
            }.bind(this));
        }

        return new Ember.RSVP.Promise(function(resolve) {
            var socket = this.get('socketService').socketFor(socketAddress);

            socket.kill = function() {
                socket.off('close', socketClosed.bind(this));
                socket.close();
                this.set('joinSocket', null);
            }.bind(this);

            socket.on('open', function () {
                reconnectsLeft = 5;
                this.set('joinSocket', socket);
                resolve(socket);
            }, this);
            socket.on('message', function (event) {
                if (!event.data) {
                    return;
                }

                var d = JSON.parse(event.data);
                handlerFn(d);
            }.bind(this), this);
            socket.on('close', socketClosed.bind(this), this);

            // If it was already open, we still need to resolve the promise and save the socket
            if (this.get('socketService').websocketIsNotClosed(socket)) {
                this.set('joinSocket', socket);
                resolve(socket);
            }
        }.bind(this));

        function socketClosed()
        {
            if ( reconnectsLeft > 0 ) {
                socket.reconnect();
                reconnectsLeft--;
            }
            else {
                this.set('joinSocket', null);
            }
        }
    },
    getCreateSocket: function(id, handlerFn){
        var socketAddress = this.get('socketHost') + 'create/' + id;

        var socket = this.get('createSocket');

        if (socket != null  && this.get('socketService').websocketIsNotClosed(socket))
        {
            return new Ember.RSVP.Promise(function(resolve) {
                resolve(this.get('createSocket'));
                console.log('case 1');
            }.bind(this));
        }

        var reconnectsLeft = 5;

        return new Ember.RSVP.Promise(function(resolve){
            var socket = this.get('socketService').socketFor(socketAddress);

            socket.kill = function() {
                socket.off('close', socketClosed.bind(this));
                socket.close();
                this.set('createSocket', null);
            }.bind(this);

            socket.on('open', function(){
                reconnectsLeft = 5;
                this.set('createSocket', socket);
                resolve(socket);
                console.log('case 2');
            }, this);
            socket.on('message', function(event){
                if ( !event.data ) {
                    return;
                }

                console.log('Got socket message: ' + event.data);

                var d = JSON.parse(event.data);

                handlerFn(d);
            }, this);
            socket.on('close',socketClosed.bind(this), this);

            if (socket.readyState() === WebSocket.OPEN) {
                this.set('createSocket', socket);
                resolve(socket);
                console.log('case 3');
            }
        }.bind(this));

        function socketClosed()
        {
            if ( reconnectsLeft > 0 ) {
                socket.reconnect();
                reconnectsLeft--;
            }
            else {
                this.set('createSocket', null);
            }
        }
    }
});

export default svc;

