import Ember from 'ember';

export default Ember.Component.extend({
	accuserText: Ember.computed('accusation.accuser.id', 'me.id', 'accusation.accuser.name', function(){
		if (this.get('accusation.accuser.id') === this.get('me.id') ) {
			return 'You have';
		}

		return this.get('accusation.accuser.name') + ' has';
	}),
	accusedText: Ember.computed('accusation.accused.id', 'me.id', 'accusation.accused.name', function(){
		if (this.get('accusation.accused.id') === this.get('me.id') ) {
			return 'You';
		}

		return this.get('accusation.accused.name');
	})
});
