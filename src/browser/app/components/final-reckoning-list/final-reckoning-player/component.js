import Ember from 'ember';

export default Ember.Component.extend({
    hasAccused: Ember.computed('player.accusationsMade.@each.gameState', function() { 
        return this.get('player.accusationsMade').isAny('gameState','finalReckoning');
    }),
    getAccused: Ember.computed('player.accusationsMade.@each.accuser', function() { 
        return this.get('player.accusationsMade').filterBy('gameState','finalReckoning')[0].get('accused.name');
    }),
    canNominate: Ember.computed('me.isCreator', 'accuser', function() {
        return this.get('me.isCreator') && !this.get('accuser');
    }),
    actions: {
        nominate(player) {
            this.sendAction("nominate", player);
        }
    }
});
