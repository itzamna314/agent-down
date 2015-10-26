import Ember from 'ember';

export default Ember.Component.extend({
	canVote: Ember.computed('accusation.accuser.id', 'me.id', 'me.accusationMade', 'accusation.votes', function(){
		var accuserIsNotMe = this.get('accusation.accuser.id') !== this.get('me.id');
		var accusedIsNotMe = this.get('accusation.accused.id') !== this.get('me.id');
		var myVote = this.get('accusation.votes').findBy('player.id', this.get('me.id'));

		return accuserIsNotMe && accusedIsNotMe && !myVote;
	}),
	actions: {
		innocent: function(){
			this.sendAction('innocent');
		},
		guilty: function(){
			this.sendAction('guilty');
		}
	}
});
