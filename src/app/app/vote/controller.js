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

            sock.on('voted', function(/*o*/){
            	console.log('voted');
                this.get('model').reload();
            }.bind(this));

        }.bind(this), function(reason) {
            console.log('Error: ' + reason);
            this.transitionToRoute('index');
        }.bind(this));
    },
    actions:{
        vote:function(isGuilty){
            var gs = this.get('gameState');
            var sock = this.get('socket');

            gs.vote(this.get('store'), isGuilty).then(function(vote){
                sock.writeSocket({
                    name: 'voted',
                    data: {
                        accusation: this.get('model.id'),
                        accuse: isGuilty
                    }
                });
            }.bind(this),
            function(reason){
                alert('Could not vote: ' + reason);
            }.bind(this));
        }
    }
});
