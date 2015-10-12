import DS from 'ember-data';

var Player = DS.Model.extend({
    name: DS.attr('string'),
    isCreator: DS.attr('boolean'),
    isSpy: DS.attr('boolean'),
    hasAccused: DS.attr('boolean'),
    game: DS.belongsTo('game', {async: true, inverse: 'players'})
});

export default Player;

