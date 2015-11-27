import Ember from 'ember';

export default Ember.Service.extend({
	secondsRemaining: null,
	time: Ember.computed('secondsRemaining', () => {
		if ( !secondsRemaining ){ return '0:00'; }

		var mins = secondsRemaining / 60;
		var secs = secondsRemaining % 60;

		return `${mins}:${secs}`;
	}),
	_running: false,
	isRunning: Ember.computed('_running', {
		get(key) {
			return this.get('_running');
		},
		set (key, value, prev) {
			this.set('_running', value);

			if ( !prev && value ) {
				tick();
			}
		}
	}),
	tick: function() {
		secondsRemaining = secondsRemaining - 1;

		if ( isRunning ) {
			Ember.run.later(this, () => this.tick());
		}
	}
});
