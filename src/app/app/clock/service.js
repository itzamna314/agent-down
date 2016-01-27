import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {
	secondsRemaining: null,
	start: null,
	elapsed: null,
	time: Ember.computed('secondsRemaining', function() { 
		if ( this.get('secondsRemaining') < 0 ){ return '0:00'; }

		var mins = Math.floor(this.get('secondsRemaining') / 60);
		var secs = Math.ceil(this.get('secondsRemaining') % 60);

        if (secs < 10 ) {
            secs = '0' + secs;
        }

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

                var remaining = this.get('secondsRemaining');

                if ( remaining <= 0 ) {
                    this.trigger('expired', {});
                }

				this.set('secondsRemaining', remaining - 1);

				var creep = (new Date().getTime() - this.get('start')) - this.get('elapsed');

				this.tick(1000 - creep);
			}, 
			adjustedTime || 1000);
		}
	}
});
