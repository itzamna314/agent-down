import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['guess-location-location'],
    actions: {
        click(location) {
            this.sendAction('action', location);
        }
    }
});
