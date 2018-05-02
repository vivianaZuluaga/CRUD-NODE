const path = require('path');
const morgan = require('morgan');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
//permite hacer peticiones PUT desde un formulario
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const app = express();
const mongoose = require('mongoose');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost/crud-node')
  .then(() => console.log('Conexión a la base de datos establecida'))
  .catch(err => console.log(err));

// Configuración del servidor
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'src', 'views'));
app.engine('handlebars', exphbs({
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Ruta passport
require('./src/config/passport')(passport);

// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Middleware de autenticación
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Variables globales
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use(require('./src/routes/index'));
app.use('/users', require('./src/routes/users'));

// Se inicia el servidor
app.listen(app.get('port'), () => {
  console.log(`Servidor en puerto ${app.get('port')}`);
});
