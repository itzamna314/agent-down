import Ember from 'ember';

export default Ember.Component.extend({
    classNameBindings: ['hide'],
    classNames: ['collapsible-div'],
    hide: true,
    title: { isTitle: true },
    content: { isContent: true },
    actions: {
        click() {
            this.toggleProperty('hide');
        }
    }
});
