import Ember from 'ember';

export default Ember.Route.extend({
    actions:{
        didTransition:function(){
            this.get('controller').send('reset');
        }
    }
});
