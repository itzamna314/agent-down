import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        joinGame(game){
            this.sendAction('action', game);
        }
    }
});
