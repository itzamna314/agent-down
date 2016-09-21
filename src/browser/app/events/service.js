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
            return new Ember.RSVP.Promise(
                (resolve) => {
                    resolve(this.get('joinSocket'));
                }
            );
        }

        return new Ember.RSVP.Promise(
            (resolve,reject) => {
                try
                {
                    var socket = this.get('socketService').socketFor(socketAddress);

                    socket.kill = function() {
                        socket.off('close', socketClosed.bind(this));
                        socket.close();
                        this.set('joinSocket', null);
                    }.bind(this);

                    socket.on('open', () => {
                        reconnectsLeft = 5;
                        this.set('joinSocket', socket);
                        resolve(socket);
                    }, this);

                    socket.on('message', (event) => {
                        if (!event.data) {
                            return;
                        }

                        var d = JSON.parse(event.data);
                        handlerFn(d);
                    }, this);

                    socket.isOpen = () => {
                        return socket.readyState() === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING;
                    };

                    socket.on('close', socketClosed.bind(this, 
                        () => { reject('Socket closed prematurely'); 
                        }
                    ), this);

                    if (socket.readyState() === WebSocket.OPEN) {
                        this.set('createSocket', socket);
                        resolve(socket);
                    } else if (socket.readyState() !== WebSocket.CONNECTING) {
                        reject("failed to open socket");
                    }
                }
                catch(ex)
                {
                    reject('Failed to open socket');
                }
            }
        );

        function socketClosed(onFail)
        {
            var socket = this.get('joinSocket');

            if ( reconnectsLeft > 0 && socket) {
                socket.reconnect();
                reconnectsLeft--;
            }
            else {
                this.set('joinSocket', null);
                onFail();
            }
        }
    },
    getCreateSocket: function(id, handlerFn){
        var socketAddress = this.get('socketHost') + 'create/' + id;

        var socket = this.get('createSocket');

        if (socket != null  && this.get('socketService').websocketIsNotClosed(socket))
        {
            return new Ember.RSVP.Promise((resolve /*,reject*/) => {
                socket.on('message', function(event){
                    if ( !event.data ) {
                        return;
                    }
                    console.log('Got socket message: ' + event.data);
                    var d = JSON.parse(event.data);

                    handlerFn(d);
                }, this);

                resolve(socket);
            });
        }

        var reconnectsLeft = 5;

        return new Ember.RSVP.Promise((resolve,reject) => {
            var socket = this.get('socketService').socketFor(socketAddress);

            socket.kill = () => {
                socket.off('close', socketClosed.bind(this));
                socket.close();
                this.set('createSocket', null);
            };

            socket.on('open', function(){
                reconnectsLeft = 5;
                this.set('createSocket', socket);
                resolve(socket);
            }, this);
            socket.on('message', function(event){
                if ( !event.data ) {
                    return;
                }
                var d = JSON.parse(event.data);

                handlerFn(d);
            }, this);
            
            socket.isOpen = () => {
                return socket.readyState() === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING;
            };

            socket.on('close',socketClosed.bind(this,
                    () => {
                        reject("Socket closed prematurely");
                    }
                ),
            this);

            if (socket.readyState() === WebSocket.OPEN) {
                this.set('createSocket', socket);
                resolve(socket);
            } else if (socket.readyState() !== WebSocket.CONNECTING) {
                reject("failed to open socket");
            }
        });

        function socketClosed(onFail)
        {
            var socket = this.get('createSocket');

            if ( reconnectsLeft > 0 && socket) {
                socket.reconnect();
                reconnectsLeft--;
            }
            else {
                this.set('createSocket', null);
                onFail();
            }
        }
    }
});

export default svc;

