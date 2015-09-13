import DS from 'ember-data';

var Location = DS.Model.extend({
    games: DS.hasMany('game', {async: true}),
    name: DS.attr('string'),
    image: DS.attr('string')
});

export default Location;
