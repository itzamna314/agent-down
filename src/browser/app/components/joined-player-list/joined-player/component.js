import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'li',
    showKick: Ember.computed('isCreator', 'player.isCreator', function(){
		return this.get('isCreator') && !this.get('player.isCreator');
    }),
    actions:{
    	click(player) {
			this.sendAction('action', player);
    	}
    }
});
