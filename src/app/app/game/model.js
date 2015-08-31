import DS from 'ember-data';

var Game = DS.Model.extend({
    players: DS.hasMany('player', {async:true}),
    spy: DS.belongsTo('player', {async:true}),
    accused: DS.belongsTo('player', {async:true}),
    creator: DS.belongsTo('player', {async:true}),
    createdOn: DS.attr('date'),
    state: DS.attr('string'),
    secondsRemaining: DS.attr('number'),
    location: DS.belongsTo('location', {async:true}),
    latitude: DS.attr('number'),
    longitude: DS.attr('number')
});

export default Game;
