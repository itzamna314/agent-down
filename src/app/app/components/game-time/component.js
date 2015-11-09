import Ember from 'ember';

export default Ember.Component.extend({
	stopped: false,
	startTimer: function(){
		 Ember.run.later(this, this.tick);
	}.on('init'),
	stopTimer: function() {
		this.set('stopped', true);
	}.on('willDestroyElement'),
	currentTime: Ember.computed('time', function(){
		var totalSeconds = this.get('time');
		var minutes = Math.floor(totalSeconds / 60);
		var seconds = Math.ceil(totalSeconds % 60);

		if ( seconds < 10 ) {
			seconds = '0' + seconds;
		}

		return minutes + ':' + seconds;
	}),
	tick: function(){
		if ( this.get('stopped') ) {
			return;
		}

		this.set('time', this.get('time') - 1);

		if ( this.get('time') > 0 ) {
			Ember.run.later(this, this.tick, 1000);
		} 
		else {
			console.log('time up')
		}
	},
});
