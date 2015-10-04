import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'li',

    showKick: Ember.computed('isCreator', 'p.isCreator', function(){
		return this.get('isCreator') && !this.get('player.isCreator');
    })
});
