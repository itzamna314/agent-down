import Ember from 'ember';

export default Ember.Component.extend({
	accuserIsNotMe: Ember.computed('accusation.accuser.id', 'me.id', function(){
		return this.get('accusation.accuser.id') !== this.get('me.id');
	})
});
