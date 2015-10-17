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
        }.bind(this), function(reason) {
            console.log('Error: ' + reason);
            this.transitionToRoute('index');
        }.bind(this));
    },
    actions:{
        accuse:function(player){
            var gs = this.get('gameState');

            gs.accuse(this.get('store'), player).then(function(accusation){
                sock.writeSocket({
                    name: 'accused',
                    data: {
                        accused: player.get('id'),
                        accuser: gameState.get('player.id')
                    }
                });
            }.bind(this),
            function(reason){
                alert('Could not accuse ' + player.get('name') + ': ' + reason);
            }.bind(this));
        }
    }
});
