module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var votesRouter = express.Router();

  var allVotes = [{
      id: '1',
      player: 2,
      accusation: 1,
      accuse: true
  }, {
      id: '2',
      player: 3,
      accusation: 1,
      accuse: false
  }, {
      id: '3',
      player: 6,
      accusation: 2,
      accuse: true
  }, {
     id: '4',
     player: 5,
     accusation: 3,
     accuse: true
  }, {
      id: '5',
      player: 7,
      accusation: 2,
      accuse: false
  }, {
      id: '6',
      player: 7,
      accusation: 3,
      accuse: true
  }, {
      id: '7',
      player: 2,
      accusation: 4,
      accuse: true
  }
  ];
  
  votesRouter.get('/', function(req, res) {
    res.send({
      'votes': allVotes.filter((function(g){
          return !req.query.state || req.query.state == g.state;
      }))
    });
  });

  votesRouter.post('/', function(req, res) {
      var body     = req.body;
      body.vote.id = 1;

      res.send(allVotes[body.vote.id]);
  });

  votesRouter.get('/:id', function(req, res) {
    res.send({
      'vote': allVotes.filter((function(g) {
          return g.id == req.params.id;
      }))[0]
    });
  });

  votesRouter.put('/:id', function(req, res) {
      var g = allVotes[0];
      g.id = req.params.id;

    res.send({
      'votes': g
    });
  });

  votesRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use(function (req, res, next) {
    req.testing = 'testing';
    return next();
  });

  app.use('/api/votes', bodyParser.json(), votesRouter);
};
