import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'li',
	showAccuse: Ember.computed('player.hasAccused', function(){
		return !this.get('player.accusationMade.state') && this.get('player') !== this.get('me');
	}),
    actions:{
    	click(player) {
			this.sendAction('action', player);
    	}
    }
});
