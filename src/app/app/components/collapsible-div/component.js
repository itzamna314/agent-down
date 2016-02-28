import Ember from 'ember';

export default Ember.Component.extend({
    classNameBindings: ['hide'],
    classNames: ['collapsible-div'],
    hide: true,
    actions: {
        click() {
            this.toggleProperty('hide');
        }
    }
});
