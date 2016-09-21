import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['active-player-list'],
	actions: {
        accusePlayer(player){
            this.sendAction('action', player);
        }
    }
});
