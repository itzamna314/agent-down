module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var gamesRouter = express.Router();

  var allGames = [{
      id: 1,
      creator: 1,
      spy: 2,
      createdOn: '2015-08-30',
      state: 'active',
      location: 1,
      locationGuess: null,
      latitude: 47.6183360,
      longitude: -122.3535720, 
      players: [1,2,3],
      secondsRemaining: 5,
      victoryType: null,
      accusations: [1]
  }, {
      id: 2,
      creator: 4,
      spy: null,
      createdOn: '2015-08-31',
      state: 'awaitingPlayers',
      location: null,
      locationGuess: null,
      latitude: 47.6183360,
      longitude: -122.3535720, 
      players: [4],
      victoryType: null,
      accusations: []
  }, {
      id: 3,
      creator: 5,
      spy: 6,
      createdOn: '2016-01-19',
      state: 'playersWin',
      location: 2,
      locationGuess: null,
      latitude: 47.6,
      longitude: -122,
      players: [5,6,7],
      victoryType: 'vote',
      accusations: [2,3]
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
    console.log('get games by id ' + req.params.id)
      
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
    req.testing = 'testing';
    return next();
  });

  app.use('/api/games', bodyParser.json(), gamesRouter);
};
