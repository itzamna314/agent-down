import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['enter-join-code'],
    actions: {
        click() {
            this.sendAction('action');
        }
    }
});
