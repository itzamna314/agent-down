import Ember from 'ember';

export default Ember.Route.extend({
    needs: ['gameState'],
    model: function() {
        var self = this;
        var g = self.get('controllers.gameState');

        return Ember.RSVP.hash({
            game: self.get('controllers.gameState').game
        })
    }
});
