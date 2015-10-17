import Ember from 'ember';

export default Ember.Route.extend({
	model: function(params) {
        return this.store.find('accusation', params.accusation_id);
    },
});
