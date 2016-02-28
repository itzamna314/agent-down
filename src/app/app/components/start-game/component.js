import Ember from 'ember';

export default Ember.Component.extend({
    notEnoughPlayers: Ember.computed('players', function() {
        return this.get('players.length') < 3;
    }),
    missingPlayers: Ember.computed('players', function() {
        return 3 - this.get('players.length');
    }),
    buttonText: Ember.computed('players', function() {
        if ( this.get('notEnoughPlayers') ) {
            var plural = this.get('missingPlayers') == 1 ? 'player' : 'players';

            return `Add ${this.get('missingPlayers')} more ${plural}`;
        }

        return `Start`;
    }),
    actions: {
        click () {
            this.sendAction();
        }
    }
});
