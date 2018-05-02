const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = (passport) => {

  /**
   * [Determina qué datos del objeto usuario deben almacenarse en la sesión]
   */
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });


  /**
   * [Se recupera el objeto usuario con el id]
   */
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });


  /**
   * [Método de autenticación]
   */
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, async (email, password, done) => {
    const user = await User.findOne({email: email});
    if (!user) {
      return done(null, false, {message: 'No existe un usuario registrado con el correo '+email});
    }

    //Se compara la contraseña del usuario con la proporcionada para determinar si la ha escrito
    //de manera correcta
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message: 'Contraseña incorrecta'});
      }
    })
  }))

};
