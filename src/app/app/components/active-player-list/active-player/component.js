import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'li',
	showAccuse: Ember.computed('accusationMade', function(){
		return !this.get('accusationMade') && this.get('player') !== this.get('me');
	}),
    accusationMade: Ember.computed('me.accustionsMade.@each.gameState', function() {
        var acc = this.get('me.accusationsMade');
        if ( !acc ) {
            return null;
        }
        return acc.filterBy('gameState', this.get('gameState'))[0];  
    }),
    actions:{
    	click(player) {
			this.sendAction('action', player);
    	}
    }
});
