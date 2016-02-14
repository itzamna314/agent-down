import Ember from 'ember';

export default Ember.Component.extend({
    command: Ember.computed('allow', function() {
        if (this.get('allow') ) { 
            return 'open'; 
        } else {
            return 'closed';
        }
    }),
    actions: {
        click() {
            this.sendAction();
        }
    }
});
