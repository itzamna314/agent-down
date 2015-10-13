import DS from 'ember-data';

var Player = DS.Model.extend({
    name: DS.attr('string'),
    isCreator: DS.attr('boolean'),
    isSpy: DS.attr('boolean'),
    accusationMade: DS.belongsTo('accusation', {async: true, inverse: 'accuser'}),
    accusationsAgainst: DS.hasMany('accusation', {async: true, inverse: 'accused'}),
    votes: DS.hasMany('vote', {async: true}),
    game: DS.belongsTo('game', {async: true, inverse: 'players'})
});

export default Player;

