module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var locationsRouter = express.Router();

  var allLocations = [{
      id: '1',
      name: 'beach',
      image: 'http://www.hiltonhawaiianvillage.com/assets/img/discover/oahu-island-activities/HHV_Oahu-island-activities_Content_Beaches_455x248_x2.jpg',
      games: [1]
  }, {
    id: '2',
    name: 'Pirate Ship',
    image: 'http://images.birthdayexpress.com/mgen/jointed-pirate-ship-cutout-bx-23470.jpg?zm=1600,1600,1,0,0',
    games: [3]
  }];

  locationsRouter.get('/', function(req, res) {
    res.send({
      'locations': allLocations.filter((function(g){
          return !req.query.state || req.query.state == g.state;
      }))
    });
  });

  locationsRouter.post('/', function(req, res) {
      var body     = req.body;
      body.game.id = 1;

      res.send(allLocations[body.game.id]);
  });

  locationsRouter.get('/:id', function(req, res) {
    res.send({
      'location': allLocations.filter((function(g) {
          return g.id == req.params.id;
      }))[0]
    });
  });

  locationsRouter.put('/:id', function(req, res) {
      var g = allLocations[0];
      g.id = req.params.id;

    res.send({
      'locations': g
    });
  });

  locationsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use(function (req, res, next) {
    req.testing = 'testing';
    return next();
  });

  app.use('/api/locations', bodyParser.json(), locationsRouter);
};
