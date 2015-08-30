import DS from 'ember-data';

var Location = DS.Model.extend({
    games: DS.hasMany('game'),
    name: DS.attr('string'),
    image: DS.attr('string')
});

Location.reopenClass({
    FIXTURES:[{
        id: 1,
        name: 'beach',
        image: 'beach'
    }]

});

export default Location;
