import DS from 'ember-data';

var Player = DS.Model.extend({
    name: DS.attr('string'),
    isCreator: DS.attr('boolean'),
    isSpy: DS.attr('boolean'),
    accusationsMade: DS.hasMany('accusation', {async: true, inverse: 'accuser'}),
    accusationsAgainst: DS.hasMany('accusation', {async: true, inverse: 'accused'}),
    votes: DS.hasMany('vote', {async: true}),
    game: DS.belongsTo('game', {async: true, inverse: 'players'}),
    joinCode: DS.attr('string')
});

export default Player;

