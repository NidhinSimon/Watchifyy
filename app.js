const express = require('express');

const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const user_route = require('./router/userRoute');
const admin_route = require('./router/adminRoute');
const flash = require('express-flash');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();





  mongoose.connect(process.env.MONGO_DB)
  .then(() => console.log('Db is connected'))
  .catch((err) => { console.log(err) });

  

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(session({
  secret: 'uuidv4',
  resave: false,
  saveUninitialized: false
}));




app.use(function (req, res, next) {
  res.header("Cache-Control", "no-cache, no-store");
  next();
});

app.get('/handleexpiredoffers',);


app.use(user_route);
app.use(admin_route);
app.use(morgan('tiny'));

app.listen(5000, function () {
  console.log('server is running on http://localhost:5000');
});
