var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('alocados/vwLstAlocados', {
        title: 'Alocações de animais',
        showNavbar: true,
        activeMenu: 'alocados',
        servidor: process.env.SERVIDOR
    });
});

router.get('/form', function(req, res) {
    res.render('alocados/vwFormAlocados', {
        title: 'Formulário de alocações',
        showNavbar: true,
        activeMenu: 'alocados',
        servidor: process.env.SERVIDOR,
        oper: req.query.oper || 'Cr'
    });
});

module.exports = router;
