import Ember from 'ember';

export default Ember.Service.extend({
	secondsRemaining: null,
	start: null,
	elapsed: null,
	time: Ember.computed('secondsRemaining', () => {
		if ( !this.get('secondsRemaining') ){ return '0:00'; }

		var mins = this.get('secondsRemaining') / 60;
		var secs = this.get('secondsRemaining') % 60;

		return `${mins}:${secs}`;
	}),
	_running: false,
	isRunning: Ember.computed('_running', {
		get(/*key*/) {
			return this.get('_running');
		},
		set (key, value) {
			var prev = this.get('_running');
			this.set('_running', value);

			if ( !prev && value ) {
				this.set('start', new Date().getTime());
				this.set('elapsed', 0);
				this.tick();
			}
		}
	}),
	tick: function(adjustedTime) {
		if ( this.get('_running') ) {
			Ember.run.later(this, () => {
				this.set('elapsed', this.get('elapsed') + 1000);

				this.set('secondsRemaining', this.get('secondsRemaining') - 1);

				var creep = (new Date().getTime() - this.get('start')) - this.get('elapsed');

				this.tick(1000 - creep);
			}, 
			adjustedTime || 1000);
		}
	}
});
