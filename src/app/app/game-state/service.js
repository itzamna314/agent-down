import Ember from 'ember';

export default Ember.Service.extend({
    game: null,
    player: null,
    newGame: function(store, creatorName, doneFunc) {
        var self = this;
        console.log('Creating game');

        var game = store.createRecord('game', {
            createdOn: '08/30/2015',
            state: 'awaitingPlayers'
        });

        console.log('Created game');
        console.log(game);

        var gamePromise = game.save();

        gamePromise.then(function(game) {
            console.log('Saved game');

            var player = store.createRecord('player', {
                game: game,
                name: creatorName,
                isCreator: true,
                hasAccused: null,
                isSpy: null
            });


            player.save().then(function(player){
                game.set('creator', player);

                game.save().then(function(game){
                    self.game = game;
                });
            });

            console.log('Created player');

            /*playerPromise.then(function(player) {
                game.set('creator', player);

                game.save().then(doneFunc);
            });*/
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
        if ( this.player == null ) {
            doneFunc();
        }

        this.player.set('game', game);
        this.player.save().then(function(){
            doneFunc(game);
        });
    }
});
