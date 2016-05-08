import DS from 'ember-data';

var Game = DS.Model.extend({
    players: DS.hasMany('player', {async: true}),
    accusations: DS.hasMany('accusation', {async: true}),
    creator: DS.belongsTo('player', {async: true}),
    spy: DS.belongsTo('player', {async: true}),
    joinCode: DS.attr('string'),
    location: DS.belongsTo('location', {async: true, inverse:'games'}),
    locationGuess: DS.belongsTo('location', {async: true}),
    state: DS.attr('string'),
    victoryType: DS.attr('string'),
    latitude: DS.attr('number'),
    longitude: DS.attr('number')
});

export default Game;
