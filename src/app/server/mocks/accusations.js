module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var accusationsRouter = express.Router();
  
  var allAccusations = [
      {
          'id':1,
          'accuser':2,
          'accused':1,
          'game':1,
          'votes':[1,2],
          'state':'voting'
      }
  ];


  accusationsRouter.get('/', function(req, res) {
    res.send({
      'accusations':allAccusations 
    });
  });

  accusationsRouter.post('/', function(req, res) {
      res.send({
          'accusation':allAccusations[1]
      });
  });

  accusationsRouter.get('/:id', function(req, res) {
    res.send({
      'accusation': allAccusation.filter((function(a) {
          return a.id == req.params.id;
      }))[0]
    });
  });

  accusationsRouter.put('/:id', function(req, res) {
      var a = allAccusations.filter(function(a) {
          return a.id == req.params.id;
      })[0];
      a.id = req.params.id;

    res.send({
      'accusations': a 
    });
  });

  accusationsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use(function (req, res, next) {
    console.log('middleware');
    req.testing = 'testing';
    return next();
  });

  app.use('/api/accusations', bodyParser.json(), accusationsRouter);
};