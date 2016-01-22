module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var playersRouter = express.Router();

  var allPlayers = [{
      id: 1,
      name: 'Itz',
      isSpy: false,
      hasAccused: false,
      game: 1,
      isCreator: true,
      accusationMade: null,
      accusationsAgainst: [1],
      votes: []
  }, {
      id: 2,
      name: 'Player 2',
      isSpy: true,
      hasAccused: null,
      game: 1,
      isCreator: false,
      accusationMade: 1,
      accusationsAgainst: [],
      votes: [1]
  }, {
      id: 3,
      name: 'Player 3',
      isSpy: false,
      hasAccused: true,
      game: 1,
      isCreator: false,
      accusationMade: [1],
      accusationsAgainst: [],
      votes: [2]
  }, {
      id: 4,
      name: 'Player 4',
      isSpy: null,
      hasAccused: null,
      game: 2
  }, {
      id: 5,
      name: 'Player 5',
      isSpy: false,
      hasAccused: true,
      game: 3,
      isCreator: false,
      accusationMade: [3],
      accusationsAgainst: [2],
      votes: [4]
  }, {
      id: 6,
      name: 'Player 6',
      isSpy: true,
      hasAccused: true,
      game: 3,
      isCreator: false,
      accusationMade: [2],
      accusationsAgainst: [3],
      votes: [3]
  }, {
      id: 7,
      name: 'Player 7',
      isSpy: false,
      hasAccused: true,
      game: 3,
      isCreator: false,
      accusationMade: [],
      accusationsAgainst: [],
      votes: [5,6]
  }];

  playersRouter.get('/', function(req, res) {
    res.send({
      'players': allPlayers
    });
  });

  playersRouter.post('/', function(req, res) {
      var body     = req.body;
      body.player.id = 1;

      res.send(body);
  });

  playersRouter.get('/:id', function(req, res) {
    res.send({
      'player': allPlayers.filter((function(p){
            return p.id == req.params.id;
        }))[0]
    });
  });

  playersRouter.put('/:id', function(req, res) {
    res.send({
      'players': {
        id: req.params.id
      }
    });
  });

  playersRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/players', bodyParser.json(), playersRouter);
};
