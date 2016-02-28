import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['game-time'],
	currentTime: Ember.computed('clock.secondsRemaining', function(){
		return this.get('clock.time');
	})
});
