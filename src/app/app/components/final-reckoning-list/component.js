import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        nominatePlayer(player){
            this.sendAction('action', player);
        }
    }
});
