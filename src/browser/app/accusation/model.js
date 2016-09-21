import DS from 'ember-data';

export default DS.Model.extend({
    accuser: DS.belongsTo('player', {async: true}),
    accused: DS.belongsTo('player', {async: true}),
    game: DS.belongsTo('game', {async: true}),
    votes: DS.hasMany('vote', {async: true}),
    state: DS.attr('string'),
    gameState: DS.attr('string')
});
