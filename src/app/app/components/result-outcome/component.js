import Ember from 'ember';

export default Ember.Component.extend({
    iWin: Ember.computed('me', 'game', 'game.state', function(){
        return this.get('game.state') === 'spyWins' && this.get('me.isSpy') ||
            this.get('game.state') === 'playersWin' && !this.get('me.isSpy');
    })
});
