import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        commitGuess(location){
            this.sendAction('action', location);
        }
    }
});
