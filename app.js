require("dotenv").config();

var express = require('express');
var path = require('path');
var session = require('express-session');
var { MongoStore } = require('connect-mongo');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var signupRouter = require('./routes/signup');
var authRouter = require('./routes/auth');
var profileRouter = require('./routes/profile');
var loginRouter = require('./routes/login');
var postsRouter = require('./routes/posts');
var estanteRouter = require('./routes/estante');
var avaliacoesRouter = require('./routes/avaliacoes');
var livroRouter = require('./routes/livro');

var connectDatabase = require('./database/db');

connectDatabase();

var app = express();



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {

  app.use(cors({
    origin: true,
    credentials: true
  }));

} else {

  app.use(cors());

}


app.use(express.json());

app.use(express.urlencoded({
  extended: false
}));


app.use(express.static(
  path.join(__dirname, 'public')
));


app.set("trust proxy", 1);


app.use(session({

  name: 'fixly.sid',

  secret: process.env.SESSION_SECRET || "segredo",

  resave: false,

  saveUninitialized: false,

  proxy: true,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 10 * 365 * 24 * 60 * 60 // 10 anos, em segundos
  }),

  cookie: {

    secure: isProduction,

    httpOnly: true,

    sameSite: isProduction ? 'none' : 'lax',

    maxAge: 10 * 365 * 24 * 60 * 60 * 1000

  }

}));


app.use('/', indexRouter);

app.use('/signup', signupRouter);

app.use('/auth', authRouter);

app.use('/profile', profileRouter);

app.use('/login', loginRouter);


app.use('/users', usersRouter);

app.use('/posts', postsRouter);

app.use('/estante', estanteRouter);

app.use('/avaliacoes', avaliacoesRouter);

app.use('/livro', livroRouter);


app.use((req, res) => {

  res.status(404).send(
    'Página não encontrada - 404'
  );

});


module.exports = app;