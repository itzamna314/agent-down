import Ember from 'ember';

export default Ember.Component.extend({
    notEnoughPlayers: Ember.computed('numMissing', function() {
        return this.get('numMissing') > 0 ;
    }),
    numMissing: Ember.computed('players', 'players.length', function() {
        return 3 - this.get('players.length');
    })
});
