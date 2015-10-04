import Ember from 'ember';

function readGameSocket(data) {
    this.trigger(data.command, data);
}

function sendOnOpen(msg, cb, sender, key/*, value, rev*/) {
    var sock = sender.get(key);
    if ( sock != null ) {
        sock.send(msg);
        cb(msg);
        sender.removeObserver(key, this, sendOnOpen);
    }
}

export function initialize(container, application) {
    var obj = Ember.Object.extend(Ember.Evented, {
        gameId: null,
        sockets: Ember.inject.service('events'),
        socket: null,
        writeSocket: function (data) {
            var msg = JSON.stringify(data);

            return new Ember.RSVP.Promise(function(resolve, reject){
                var sock = this.get('socket');
                if (!sock) {
                    this.addObserver('socket', this, sendOnOpen.bind(this, msg, resolve));
                }
                else {
                    sock.send(msg);
                    resolve(msg);
                }
            }.bind(this));
        },
        init: function () {
            this._super.apply(this, arguments);

            if (!this.get('gameId')) {
                throw {message: "Pass {gameId: 'game_id'}"};
            }

            var svc = this.get('sockets');
            svc.getCreateSocket(this.get('gameId'), readGameSocket.bind(this))
                .then(function (socket) {
                    this.set('socket', socket);
                }.bind(this)
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
