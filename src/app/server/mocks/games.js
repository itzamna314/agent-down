module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var gamesRouter = express.Router();

  var allGames = [{
      id: 1,
      spy: 2,
      creator: 1,
      createdOn: '2015-08-30',
      state: 'active',
      secondsRemaining: 420,
      location: 1,
      locationGuess: null,
      latitude: 47.6183360,
      longitude: -122.3535720, 
      players: [1,2,3],
      victoryType: null,
      accusations: [1]
  }, {
      id: 2,
      spy: null,
      accused: null,
      creator: 4,
      createdOn: '2015-08-31',
      state: 'awaitingPlayers',
      secondsRemaining: null,
      location: null,
      latitude: 47.6183360,
      longitude: -122.3535720, 
      players: [4]
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
      body.game.id = 1;

      res.send({
          'games': [allGames[body.game.id]]
      });
  });

  gamesRouter.get('/:id', function(req, res) {
    res.send({
      'game': allGames.filter((function(g) {
          return g.id == req.params.id;
      }))[0]
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
