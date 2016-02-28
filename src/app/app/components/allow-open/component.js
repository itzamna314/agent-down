import Ember from 'ember';

export default Ember.Component.extend({
    command: Ember.computed('allow', function() {
        if (this.get('allow') ) { 
            return 'allowed'; 
        } else {
            return 'forbidden';
        }
    }),
    actions: {
        click() {
            this.sendAction();
        }
    }
});
