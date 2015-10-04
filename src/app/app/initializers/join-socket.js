import Ember from 'ember';

function sendOnOpen(msg, sender, key/*, value, rev*/) {
    var sock = sender.get(key);
    if ( sock != null ) {
        sock.send(msg);
        sender.removeObserver(key, this, sendOnOpen);
    }
}

function readJoinSocket(data) {
    this.trigger('incomingGame', data);
}

export function initialize(container, application) {
    var obj = Ember.Object.extend(Ember.Evented, {
      sockets: Ember.inject.service('events'),
      socket: null,
      writeSocket: function(data) {
          var sock = this.get('socket');
          if (!sock) {
              this.addObserver('socket', this, sendOnOpen.bind(this, JSON.stringify(data)));
          }
          else {
              sock.send(JSON.stringify(data));
          }
      },
      init: function() {
          this._super.apply(this, arguments);
          var svc = this.get('sockets');
          svc.getJoinSocket(readJoinSocket.bind(this))
              .then(function(socket){
                  this.set('socket', socket);
              }.bind(this));
      },
      kill: function() {
        var sock = this.get('socket');
        if (sock) {
          sock.kill();
        }
      }
    });

    application.register('objects:joinSocket', obj, {singleton: false, instantiate: false});
}