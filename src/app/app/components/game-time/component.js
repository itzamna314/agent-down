import Ember from 'ember';

export default Ember.Component.extend({
	currentTime: Ember.computed('clock.secondsRemaining', function(){
		var totalSeconds = this.get('clock.secondsRemaining');
		var minutes = Math.floor(totalSeconds / 60);
		var seconds = Math.ceil(totalSeconds % 60);

		if ( seconds < 10 ) {
			seconds = '0' + seconds;
		}

		return minutes + ':' + seconds;
	}),
	tick: Ember.observer('clock.isRunning', function (){
		if ( !this.get('clock.isRunning') ) {
			return;
		}

		this.set('clock.secondsRemaining', this.get('clock.secondsRemaining') - 1);

		if ( this.get('clock.secondsRemaining') > 0 ) {
			Ember.run.later(this, this.tick, 1000);
		} 
		else {
			console.log('time up');
		}
	})
});
