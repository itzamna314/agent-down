import DS from 'ember-data';

export default DS.Model.extend({
 	player: DS.belongsTo('player', {async: true}),
 	accusation: DS.belongsTo('accusation', {async: true}),
 	accuse: DS.attr('boolean')
});
