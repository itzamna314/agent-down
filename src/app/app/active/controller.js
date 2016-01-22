import Ember from 'ember';

import Clock from 'agent-down/clock/service';

export default Ember.Controller.extend({
	gameState: Ember.inject.service('game-state'),
    socket: null,
    clock: Clock.create(),
    init: function() {
        var gs = this.get('gameState');

        gs.reloadPlayer((playerId) => {
            return this.store.findRecord('player', playerId);
        }).then(
            () => {}, 
            () => {
                this.transitionToRoute('index');
            }
        );

        gs.reloadGame((gameId) => {
            return this.store.findRecord('game', gameId);
        }).then(
            (game) => {
                var id = game.get('id');
                var sock = this.container.lookup('objects:gameSocket').create({gameId: id});

                this.set('socket', sock);

                sock.on('accused', (o) => {
                    var accusation = o.accusation;
                    this.transitionToRoute('vote', accusation);
                });

                sock.on('clock', o => {
                    this.set('clock.secondsRemaining', o.secondsRemaining);
                    this.set('clock.isRunning', o.isRunning);
                });

                sock.writeSocket({
                    name: 'clock',
                    data: {}
                });

            }, 
            (reason) => {
                console.log('Error: ' + reason);
                this.transitionToRoute('index');
            }
        );
    },
    actions:{
        accuse:function(player){
            var gs = this.get('gameState');
            var sock = this.get('socket');

            gs.accuse(this.get('store'), player).then(function(accusation){
                sock.writeSocket({
                    name: 'accused',
                    data: {
                        accusation: accusation.get('id')
                    }
                });

                gs.vote(this.get('store'), accusation, true).then(function(/*acc*/){
                    sock.writeSocket({
                        name: 'voted',
                        data: {
                            accusation: accusation.get('id')
                        }
                    });
                });
            }.bind(this),
            function(reason){
                alert('Could not accuse ' + player.get('name') + ': ' + reason);
            }.bind(this));
        },
        viewLocations(){
            this.transitionToRoute('guess-location');
        }
    }
});
