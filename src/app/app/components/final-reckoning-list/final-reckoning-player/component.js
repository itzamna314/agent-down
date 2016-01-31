import Ember from 'ember';

export default Ember.Component.extend({
    hasAccused: Ember.computed('player.accusationsMade.@each.gameState', function() { 
        return this.get('player.accusationsMade').isAny('gameState','finalReckoning');
    }),
    getAccused: Ember.computed(function() { return `ba'alzaboot`; })
});
