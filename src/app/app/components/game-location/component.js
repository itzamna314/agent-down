import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['game-location'],
	isNotSpy: Ember.computed('isSpy', function(){
		return !this.get('isSpy');
	}),
	actions: {
		click () {
			this.sendAction('viewLocations');
		}
	}
});
