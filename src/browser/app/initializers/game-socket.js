import Ember from 'ember';

function readGameSocket(data) {
    this.trigger(data.command, data);
}

function sendOnOpen(msg, sender, key/*, value, rev*/) {
    var sock = sender.get(key);
    var sockErr = sender.get('socketErr');
    if ( sock && !sockErr && sock.isOpen()) {
        sock.send(msg);
    } 
  
    sender.removeObserver(key, this, sendOnOpen);
}

export function initialize(container, application) {
    var obj = Ember.Object.extend(Ember.Evented, {
        gameId: null,
        sockets: Ember.inject.service('events'),
        socket: null,
        socketErr: null,
        writeSocket: function (data) {
            var msg = JSON.stringify(data);

            var sock = this.get('socket');
            var sockErr = this.get('socketErr');
            if (!sock) {
                if ( !sockErr ) {
                    this.addObserver('socket', this, sendOnOpen.bind(this, msg));
                }
            } 
            else if (!sockErr && sock.isOpen()){
                sock.send(msg);
            } 
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
                        this.set('socketErr', msg);
                        this.set('socket', msg);
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
