import Ember from 'ember';

export default Ember.Route.extend({
    gameState: Ember.inject.service('game-state'),
    model: function(params) {
        return this.store.find('game', params.game_id);
    },
    afterModel: function(game /*, transition*/) {
        var gs = this.get('gameState');
        gs.set('game', game);
    }
});
