import Ember from 'ember';

export default Ember.Controller.extend({
    game:null,
    newGame: function(creatorName, doneFunc) {
        var self = this;

        var creator = this.store.createRecord('player', {
            name: creatorName,
            hasAccused: null,
            isSpy: null
        }).save()
        .then(function(creator){
            self.game = self.store.createRecord('game', {
                players:[creator],
                spy: null,
                accused: null,
                creator: creator,
                createdOn: '08/30/2015',
                state: 'awaitingPlayers',
                secondsRemaining: null,
                location: null
            });

            self.game.save().then(doneFunc);
        });
    }
});
