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
      votes: [1]
  }, {
      id: 2,
      name: 'Player 2',
      isSpy: true,
      hasAccused: null,
      game: 1,
      isCreator: false,
      accusationMade: 1,
      accusationsAgainst: [],
      votes: []
  }, {
      id: 3,
      name: 'Player 3',
      isSpy: false,
      hasAccused: true,
      game: 1,
      isCreator: false,
      accusationMade: null,
      accusationsAgainst: [],
      votes: [2]
  }, {
      id: 4,
      name: 'Player 4',
      isSpy: null,
      hasAccused: null,
      game: 2
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
