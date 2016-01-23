import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        click(location) {
            this.sendAction('action', location);
        }
    }
});
