import Ember from 'ember';

export default Ember.Component.extend({
    notEnoughPlayers: Ember.computed('players', function() {
        return this.get('players.length') < 3;
    }),
    missingPlayers: Ember.computed('players', function() {
        return 3 - this.get('players.length');
    }),
    actions: {
        click () {
            this.sendAction();
        }
    }
});
