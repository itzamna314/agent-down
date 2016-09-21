import Ember from 'ember';

export default Ember.Component.extend({
        accuserName: Ember.computed('me', 'me.id', 'accuser', 'accuser.id', 
            function() {
                if ( this.get('me.id') === this.get('accuser.id') ) {
                    return 'Your';
                } else {
                    return `${this.get('accuser.name')}'s`;
                }                    
            }
        )
});
