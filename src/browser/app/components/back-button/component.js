import Ember from 'ember';

export default Ember.Component.extend({
	actions: {
        click (game) {
            this.sendAction('action', game);
        }
    }
});
