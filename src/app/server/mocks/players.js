module.exports = function(app) {
  var express = require('express');
  var playersRouter = express.Router();

  var allPlayers = [{
      id: 1,
      name: 'Player 1',
      isSpy: false,
      hasAccused: false,
      game: 1
  }, {
      id: 2,
      name: 'Player 2',
      isSpy: true,
      hasAccused: null,
      game: 1
  }, {
      id: 3,
      name: 'Player 3',
      isSpy: false,
      hasAccused: true,
      game: 1
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
    res.status(201).end();
  });

  playersRouter.get('/:id', function(req, res) {
    res.send({
      'players': allPlayers.filter((function(p){
            return p.id == req.params.id;
        }))
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

  app.use('/api/players', playersRouter);
};
