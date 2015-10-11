import Ember from 'ember';

export default Ember.Component.extend({
	actions: {
        accusePlayer(player){
            this.sendAction('action', player);
        }
    }
});
