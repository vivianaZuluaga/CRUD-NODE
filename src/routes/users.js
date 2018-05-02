const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');


/**
 * [Función encargada de verificar que un usuario haya iniciado sesión para permitir realizar
 * ciertas acciones, si el usuario no se encuentra autenticado se muestra la pantalla de inicio 
 * sesión]
 * @param  {[type]}   req  [petición]
 * @param  {[type]}   res  [respuesta]
 * @param  {Function} next [siguiente función]
 */
function requireLogin(req, res, next) 
{
  if (req.isAuthenticated()) 
  {
    return next();
  }else{
    req.flash('error_msg', 'Debe iniciar sesión');
    res.redirect('/users/login');
  }
}


/**
 * [Permite solicitar la página principal al servidor]
 * @param  {[type]} async (req,         res [petición y respuesta]
 */
router.get('/', async (req, res) => {
  let users = await User.find({}, (err, usersStored) => {
        if (err) return res.status(500).send({ message: `Error al procesar la petición: ${err}` })
        if (!usersStored) return res.status(404).send({ message: `No existen usuarios` })
        res.status(200);
    });
  res.render('users/index', {
    users
  });
});


/**
 * [Permite solicitar un usuario al servidor. Cuando se obtiene el recurso se renderiza
 * la vista edit a la cual se le pasa el usuario devuelto por el servidor]
 * @param  {[type]} '/edit/:id' [identificación del usuario - id]
 * @param  {[type]} async       (req,         res [petición y respuesta]
 */
router.get('/edit/:id', requireLogin, async (req, res, next) => {
  let user = await User.findById(req.params.id, (err, userStored) => {
        if (err) return res.status(500).send({ message: `Error al realizar la petición: ${err}` })
        if (!userStored) return res.status(404).send({ message: `No existe el usuario` })
        res.status(200);
    });
    res.render('users/edit', {
      user
    });
});


/**
 * [Permite actualizar un usuario]
 * @param  {[type]} '/edit/:id' [identificación del usuario - id]
 * @param  {[type]} async       (req,         res [petición y respuesta]
 */
router.put('/edit/:id', async (req, res) => {
  let user = await User.findById(req.params.id, (err, userStored) => {
        if (err) return res.status(500).send({ message: `Error al realizar la petición: ${err}` })
        if (!userStored) return res.status(404).send({ message: `No existe el usuario` })
        res.status(200);
  });

  user.name = req.body.name;
  user.last_name = req.body.last_name;
  user.address = req.body.address;
  user.city = req.body.city;
  user.state = req.body.state;
  user.country = req.body.country;
  user.phone = req.body.phone;
  user.area_code = req.body.area_code;
  user.email = req.body.email;
  await user.save((err, userStored) => {
    if (err){
      return res.status(500).send({ message: `Error al actualizar el usuario: ${err}` })
    }else{res.status(200);}
  });
  req.flash('success_msg', 'Usuario actualizado correctamente');
  res.redirect('/users');
});


/**
 * [Permite eliminar un usuario]
 * @param  {[type]} '/delete/:id' [identificación del usuario - id]
 * @param  {[type]} async         (req,         res)          [petición y respuesta]
 */
router.delete('/delete/:id', requireLogin, async (req, res, next) => {
  await User.findByIdAndRemove(req.params.id, (err, userStored) => {
        if (err) return res.status(500).send({ message: `Error al realizar la petición: ${err}` })
        if (!userStored) return res.status(404).send({ message: `No existe el usuario` })
        res.status(200);
    });
  req.flash('success_msg', 'Usuario eliminado con éxito');
  res.redirect('/users');
});


/**
 * [Permite solicitar al servidor el recurso login, una vez se obtiene se renderiza la
 * vista login]
 * @param  {[type]} '/login' [recurso solicitado]
 * @param  {[type]} (req,    res           [petición y respuesta]
 */
router.get('/login', (req, res) => {
  res.render('users/login');
});


/**
 * [Se envían los datos del login al servidor]
 * @param  {[type]} '/login' [recurso solicitado]
 * @param  {[type]} (req,    res,          next [petición, respuesta, siguiente función]
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});


/**
 * [Petición que permite solicitar el recurso register al servidor, cuando se obtiene
 * se renderiza la vista register]
 * @param  {[type]} (req,       res           [petición y respuesta]
 */
router.get('/register', (req, res) => {
  res.render('users/register');
});


/**
 * [Permite almacenar un usuario en el servidor]
 * @param  {[type]} '/register' [Recurso solicitado]
 * @param  {[type]} async       (req,         res [petición y respuesta]
 */
router.post('/register', async (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({text: 'Las contraseñas no coinciden'})
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors,
      name: req.body.name,
      last_name: req.body.last_name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      phone: req.body.phone,
      area_code: req.body.area_code,
      birthdate: req.body.birthdate,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    let user = await User.findOne({email: req.body.email}, (err, userStored) => {
        if (err) return res.status(500).send({ message: `Error al realizar la petición: ${err}` })
        res.status(200);
    });
    if (user) {
      req.flash('error_msg', 'Existe un usuario registrado con el correo '+user.email);
      //Si el usuario no se encuentra autenticado se muestra la pantalla de login
      if(!req.isAuthenticated()){res.redirect('/users/login');}
      else{res.redirect('/users/register');}
    } else {
      const newUser = new User({
        name: req.body.name,
        last_name: req.body.last_name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        phone: req.body.phone,
        area_code: req.body.area_code,
        birthdate: req.body.birthdate,
        email: req.body.email,
        password: req.body.password
      });

      //se encripta el password
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash;
      await newUser.save((err, userStored) => {
        if (err){
          return res.status(500).send({ message: `Error al guardar el usuario: ${err}` })
        }else{res.status(200);}
      });
      
      //Se verifica si el usuario está autenticado para definir a dónde dirigirlo
      if(req.isAuthenticated()){
        req.flash('success_msg', 'Usuario registrado con éxito');
        res.redirect('/users');  
      }else{
        req.flash('success_msg', 'Usuario registrado con éxito, por favor inicie sesión');
        res.redirect('/users/login'); 
      }
    }
  }
});


/**
 * [Se cierra la sesión del usuario]
 * @param  {[type]} '/logout' [petición al servidor]
 * @param  {[type]} (req,     res           [petición y respuesta]
 */
router.get('/logout', requireLogin, (req, res, next) => {
  req.logout();
  req.flash('success_msg', 'Sesión cerrada con éxito');
  res.redirect('/users/login');
});

module.exports = router;
