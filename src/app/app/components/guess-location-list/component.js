import Ember from 'ember';

export default Ember.Component.extend({
    sortedLocations: Ember.computed('locations', function() {
        var arr = this.get('locations');

        if ( !arr ) {
            return [];
        }

        arr.forEach((item) => {
            item.set('sortKey', Math.random());
        });

        return arr.sortBy('sortKey');
    }),
    actions: {
        commitGuess(location){
            this.sendAction('action', location);
        }
    }
});
