import DS from 'ember-data';

var Game = DS.Model.extend({
    players: DS.hasMany('player', {async: true}),
    creator: DS.belongsTo('player', {async: true}),
    location: DS.belongsTo('location', {async: true}),
    state: DS.attr('string'),
    secondsRemaining: DS.attr('number'),
    latitude: DS.attr('number'),
    longitude: DS.attr('number')
});

export default Game;
