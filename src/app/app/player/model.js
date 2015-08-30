import DS from 'ember-data';

var Player = DS.Model.extend({
    name: DS.attr('string'),
    isSpy: DS.attr('boolean'),
    hasAccused: DS.attr('boolean'),
    game: DS.belongsTo('game', {
        inverse: 'players'
    })
});

export default Player;

