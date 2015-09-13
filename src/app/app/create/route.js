import Ember from 'ember';

Ember.RSVP.makePromise = function(maybePromise) {
    // Test if it's a promise
    if (maybePromise.then) {
        // Then return it
        return maybePromise;
    } else {
        // Wrap it in a Promise that resolves directly
        return Ember.RSVP.resolve(maybePromise);
    }
};

export default Ember.Route.extend({
    model: function(params) {
        return this.store.find('game', params.game_id)
    },
    afterModel: function(game, transition) {

        // Pre-load the players
        // The 'get' call will result in an AJAX call to get
        // the players and returns a promise
        Ember.RSVP.makePromise(game.get('players')).then(function(players){
            game.reload();
        });
    }
});
