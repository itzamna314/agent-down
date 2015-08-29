import DS from 'ember-data';

var Player = export default DS.Model.extend({
    name: DS.attr('string'),
    isSpy: DS.attr('bool'),
    hasAccused: DS.attr('bool')
});

Player.repoenClass({
  FIXTURES:[
    {
      id: 1,
      name: 'Player 1',
      isSpy: false,
      hasAccused: false
    },
    {
      id: 2,
      name: 'Player 2',
      isSpy: true,
      hasAccused: null
    },
    {
      id: 3,
      name: 'Player 3',
      isSpy: false,
      hasAccused: true
    }
  ]
});

