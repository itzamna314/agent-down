import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['result-outcome'],
    iWin: Ember.computed('me', 'game', 'game.state', function(){
        return this.get('game.state') === 'spyWins' && this.get('me.isSpy') ||
            this.get('game.state') === 'playersWin' && !this.get('me.isSpy');
    }),
    wonByAccusation: Ember.computed('game', 'game.victoryType', function() {
        return this.get('game.victoryType') === 'accuse';
    }),
    wonBySpyGuess: Ember.computed('game', 'game.victoryType', function() {
        return this.get('game.victoryType') === 'guess';
    }),
    wonByDefault: Ember.computed('game', 'game.victoryType', function() {
        return this.get('game.victoryType') === 'default';
    }),
    accusedName: Ember.computed('game', 'game.accusations.@each.state', function() {
        var guiltyAcc = this.get('game.accusations').filterBy('state', 'guilty')[0];
        if ( guiltyAcc ) {
            return guiltyAcc.get('accused.name');
        }

        return '';
    }),
    locationGuess: Ember.computed('game', 'game.locationGuess', function() {
        return this.get('game.locationGuess.name');
    })
});
