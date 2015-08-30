module.exports = function(app) {
  var express = require('express');
  var gamesRouter = express.Router();

  var allGames = [{
      id: 1,
      spy: 2,
      accused: null,
      creator: 1,
      createdOn: '2015-08-30',
      state: 'active',
      secondsRemaining: 420,
      location: 1
  }, {
      id: 2,
      spy: null,
      accused: null,
      creator: 2,
      createdOn: '2015-08-31',
      state: 'awaitingPlayers',
      secondsRemaining: null,
      location: null
  }];

  gamesRouter.get('/', function(req, res) {
    res.send({
      'games': allGames.filter((function(g){
          return !req.query.state || req.query.state == g.state;
      }))
    });
  });

  gamesRouter.post('/', function(req, res) {
    res.status(201).end();
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

  app.use('/api/games', gamesRouter);
};
