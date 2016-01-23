import Ember from 'ember';

function readGameSocket(data) {
    this.trigger(data.command, data);
}

function sendOnOpen(msg, successCb, errorCb, sender, key/*, value, rev*/) {
    var sock = sender.get(key);
    var sockErr = sender.get('socketErr');
    if ( sock && !sockErr && sock.isOpen()) {
        sock.send(msg);
        successCb(msg);
        sender.removeObserver(key, this, sendOnOpen);
    } else if (!sockErr ) {
       errorCb(sockErr); 
    } else {
        errorCb("websocket failed to open");
    }
}

export function initialize(container, application) {
    var obj = Ember.Object.extend(Ember.Evented, {
        gameId: null,
        sockets: Ember.inject.service('events'),
        socket: null,
        socketErr: null,
        writeSocket: function (data) {
            var msg = JSON.stringify(data);

            return new Ember.RSVP.Promise((resolve, reject) => {
                var sock = this.get('socket');
                var sockErr = this.get('socketErr');
                if (!sock) {
                    if ( !sockErr ) {
                        this.addObserver('socket', this, sendOnOpen.bind(this, msg, resolve, reject));
                    } else {
                        reject("Socket failed to open: " + sockErr);
                    }
                } 
                else if (!sockErr && sock.isOpen()){
                    sock.send(msg);
                    resolve(msg);
                } else {
                    reject("websocket failed to open");
                }
            });
        },
        init: function () {
            this._super.apply(this, arguments);

            if (!this.get('gameId')) {
                throw {message: "Pass {gameId: 'game_id'}"};
            }

            var svc = this.get('sockets');
            svc.getCreateSocket(this.get('gameId'), readGameSocket.bind(this))
                .then(
                    (socket) => {
                        this.set('socket', socket);
                    },
                    (msg) => {
                        this.set('socket', msg);
                        this.set('socketErr', msg);
                    }
                );
        },
        kill: function() {
            var sock = this.get('socket');
            if (sock) {
                sock.kill();
            }
        }
    });

    application.register('objects:gameSocket', obj, {singleton: false, instantiate: false});
}
