var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('animais/vwLstAnimais', {
        title: 'Animais',
        showNavbar: true,
        activeMenu: 'animais',
        servidor: process.env.SERVIDOR
    });
});

router.get('/form', function(req, res) {
    res.render('animais/vwFormAnimais', {
        title: 'Formulário de animais',
        showNavbar: true,
        activeMenu: 'animais',
        servidor: process.env.SERVIDOR,
        oper: req.query.oper || 'Cr'
    });
});

module.exports = router;
