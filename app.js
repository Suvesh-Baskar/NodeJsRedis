const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', () => {
  console.log('Connected to Redis...');
});

// Set Port
const port = 3000;

// Init App
const app = express();

// View Engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Method Override
app.use(methodOverride('_method'));

// Routes

// Search Page - Home Route
app.get('/', (req, res, next) => {
  res.render('searchusers');
});

// Search Processing
app.post('/users/search', (req, res, next) => {
  let id = req.body.id;

  client.hgetall(id, (err, obj) => {
    if (!obj) {
      res.render('searchusers', {
        error: 'User does not exist'
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj
      });
    }
  });
});

// Add Users Page
app.get('/users/add', (req, res, next) => {
  res.render('adduser');
});

// Add Users Process Page
app.post('/users/add', (req, res, next) => {
  let { id, first_name, last_name, email, phone } = req.body;

  client.hmset(
    id,
    [
      'first_name',
      first_name,
      'last_name',
      last_name,
      'email',
      email,
      'phone',
      phone
    ],
    (err, reply) => {
      if (err) {
        console.log(err);
        res.render('adduser', {
          error: 'Error adding user to DB. Please try again'
        });
      } else {
        console.log(reply);
        res.redirect('/');
      }
    }
  );
});

// Delete User
app.delete('/user/delete/:id', (req, res, next) => {
  client.del(req.params.id);
  res.redirect('/');
});

// Listen
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
