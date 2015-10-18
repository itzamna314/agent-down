import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'li',
	showAccuse: Ember.computed('me.accusationMade.state', function(){
		return !this.get('me.accusationMade.state') && this.get('player') !== this.get('me');
	}),
    actions:{
    	click(player) {
			this.sendAction('action', player);
    	}
    }
});
