import Ember from 'ember';

export default Ember.Controller.extend({
    game: null,
    player: null,
    newGame: function(creatorName, doneFunc) {
        var self = this;

        this.store.createRecord('player', {
            name: creatorName,
            hasAccused: null,
            isSpy: null
        }).save()
        .then(function(creator){
            self.player = creator;
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
    },
    initPlayer: function(playerName, doneFunc) {
        var self = this;

        this.store.createRecord('player', {
            name: playerName,
            hasAccused: null,
            isSpy: null
        }).save().then(function(player){
            self.player = player;
            doneFunc(player);
        });
    },
    joinGame: function(game, doneFunc) {
        var self = this;
        if ( this.player == null ) {
            doneFunc();
        }

        this.player.set('game', game);
        this.player.save().then(function(){
            doneFunc(game);
        });
    }
});
