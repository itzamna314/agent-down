import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        createGame: function() {
            alert('Create!');
            this.transitionToRoute('active');
        }
    }
});
