import Ember from 'ember';

export default Ember.Route.extend({
    model: function(){
        return Ember.RSVP.hash({
            games: this.store.query('game', {state: 'awaitingPlayers'})
        });
    }
});
