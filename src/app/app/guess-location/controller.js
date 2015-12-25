import Ember from 'ember';

import Clock from 'agent-down/clock/service';

export default Ember.Controller.extend({
	gameState: Ember.inject.service('game-state'),
    socket: null,
    clock: Clock.create(),
    locations: null,
    init: function() {
        var gs = this.get('gameState');

        gs.reloadPlayer(
        	(playerId) => {
            	return this.store.findRecord('player', playerId);
        	}
    	).then(
        	() => {}, 
        	() => {
        		this.transitionToRoute('index');
        	}
    	);

        gs.reloadGame(
        	(gameId) => {
            	return this.store.findRecord('game', gameId);
        	}
    	).then(
    		(game) => {
            	var id = game.get('id');

				this.store.findAll('location', {gameId: id}).then( 
					(locations) => {
						this.set('locations', locations)
					}
				)

            	var sock = this.container.lookup('objects:gameSocket').create({gameId: id});

            	this.set('socket', sock);

            	sock.on('accused', (o) => {
                	var accusation = o.accusation;
                	this.transitionToRoute('vote', accusation);
            	});

	            sock.on('clock', (o) => {
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
});
