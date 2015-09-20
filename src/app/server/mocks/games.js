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
      longitude: null,
      players: [1,3]
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
      longitude: null,
      players: [2,4]
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
      'game': {
          id: req.params.id,
          players: [1,3]
      }
    });
  });

  gamesRouter.put('/:id', function(req, res) {
      var g = allGames[0];
      g.id = req.params.id;

    res.send({
      'games': g
    });
  });

  gamesRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use(function (req, res, next) {
    console.log('middleware');
    req.testing = 'testing';
    return next();
  });

  app.use('/api/games', bodyParser.json(), gamesRouter);
};
