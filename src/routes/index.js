const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Usuarios'
  });
});

module.exports = router;
