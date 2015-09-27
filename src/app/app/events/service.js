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

        if (this.get('joinSocket') != null )
        {
            return new Ember.RSVP.Promise(function(resolve) {
                resolve(this.get('joinSocket'));
            }.bind(this));
        }

        return new Ember.RSVP.Promise(function(resolve) {
            var socket = this.get('socketService').socketFor(socketAddress);

            socket.kill = function() {
                socket.off('close', this);
                socket.close();
                this.set('joinSocket', null);
            }.bind(this);

            var reconnectsLeft = 5;

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
            socket.on('close', function () {
                if (reconnectsLeft > 0) {
                    socket.reconnect();
                    reconnectsLeft--;
                }
                else {
                    this.set('joinSocket', null);
                }
            }.bind(this), this);
        }.bind(this));
    },
    getCreateSocket: function(id, handlerFn){
        var socketAddress = this.get('socketHost') + 'create/' + id;

        if (this.get('createSocket') != null )
        {
            return new Ember.RSVP.Promise(function(resolve) {
                resolve(this.get('createSocket'));
            }.bind(this));
        }

        return new Ember.RSVP.Promise(function(resolve){
            var socket = this.get('socketService').socketFor(socketAddress);

            var reconnectsLeft = 5;

            socket.kill = function() {
                socket.off('close', this);
                socket.close();
                this.set('createSocket', null);
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

                handlerFn(d);
            }, this);
            socket.on('close', function() {
                if ( reconnectsLeft > 0 ) {
                    socket.reconnect();
                    reconnectsLeft--;
                }
                else {
                    this.set('createSocket', null);
                }
            }, this);
        }.bind(this));
    }
});

export default svc;

