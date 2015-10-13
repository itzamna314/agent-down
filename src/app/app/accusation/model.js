import DS from 'ember-data';

export default DS.Model.extend({
    accuser: DS.belongsTo('player', {async: true}),
    accused: DS.belongsTo('player', {async: true}),
    game: DS.belongsTo('game', {async: true}),
    votes: DS.hasMany('vote', {async: true}),
    votesFor: DS.attr('number'),
    votesAgainst: DS.attr('number'),
    state: DS.attr('string')
});
