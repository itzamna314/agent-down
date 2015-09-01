module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var gamesRouter = express.Router();

  var allGames = [{
      id: 1,
      spy: 2,
      accused: null,
      creator: 1,
      createdOn: '2015-08-30',
      state: 'active',
      secondsRemaining: 420,
      location: 1,
      latitude: null,
      longitude: null
  }, {
      id: 2,
      spy: null,
      accused: null,
      creator: 4,
      createdOn: '2015-08-31',
      state: 'awaitingPlayers',
      secondsRemaining: null,
      location: null,
      latitude: null,
      longitude: null
  }];

  gamesRouter.get('/', function(req, res) {
    res.send({
      'games': allGames.filter((function(g){
          return !req.query.state || req.query.state == g.state;
      }))
    });
  });

  gamesRouter.post('/', function(req, res) {
      var body     = req.body;
      body.game.id = Math.round(Math.random() * 100);

      res.send(body);
  });

  gamesRouter.get('/:id', function(req, res) {
    res.send({
      'games': {
        id: req.params.id
      }
    });
  });

  gamesRouter.put('/:id', function(req, res) {
    res.send({
      'games': {
        id: req.params.id
      }
    });
  });

  gamesRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/games', bodyParser.json(), gamesRouter);
};