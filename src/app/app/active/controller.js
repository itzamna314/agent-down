import Ember from 'ember';

export default Ember.Controller.extend({
	gameState: Ember.inject.service('game-state'),
    socket: null,
    init: function() {
        var gs = this.get('gameState');

        gs.reloadPlayer(function(playerId){
            return this.store.findRecord('player', playerId);
        }.bind(this)).then(function(){}, function(){
            this.transitionToRoute('index');
        }.bind(this));

        gs.reloadGame(function(gameId){
            return this.store.findRecord('game', gameId);
        }.bind(this)).then(function(game){
            var id = game.get('id');
            var sock = this.container.lookup('objects:gameSocket').create({gameId: id});

            this.set('socket', sock);

            sock.on('accused', function(o){
                var accusation = o.accusation;
                this.transitionToRoute('vote', accusation);
            }.bind(this));

        }.bind(this), function(reason) {
            console.log('Error: ' + reason);
            this.transitionToRoute('index');
        }.bind(this));
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
        }
    }
});
