import Ember from 'ember';

export default Ember.Service.extend({
	socket: null,
	setGameId: function(gameId){
		if (this.get('socket') != null ) {
			return;
		}

		var sock = this.container.lookup('objects:gameSocket').create({gameId: id});
		this.set('socket', sock);
	}
});
