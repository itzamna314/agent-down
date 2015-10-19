import Ember from 'ember';

export default Ember.Component.extend({
	voterName: Ember.computed('vote.player.name', 'vote.player.id', 'me.id', function(){
		if (this.get('vote.player.id') === this.get('me.id')) {
			return 'You';
		}

		return this.get('vote.player.name');
	}),
	voteResult: Ember.computed('vote.accuse', function(){
		if ( this.get('vote.accuse') ) {
			return 'guilty';
		}

		return 'innocent';
	})
});
