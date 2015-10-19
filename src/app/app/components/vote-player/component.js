import Ember from 'ember';

export default Ember.Component.extend({
	canVote: Ember.computed('accusation.accuser.id', 'me.id', 'me.accusationMade', function(){
		var accuserIsMe = this.get('accusation.accuser.id') !== this.get('me.id');
		var iHaveAccused = !!this.get('me.accusationMade.id');
		return accuserIsMe && iHaveAccused;
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
