var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('pastos/vwLstPastos', {
        title: 'Pastos',
        showNavbar: true,
        activeMenu: 'pastos',
        servidor: process.env.SERVIDOR
    });
});

router.get('/form', function(req, res) {
    res.render('pastos/vwFormPastos', {
        title: 'Formulário de pastos',
        showNavbar: true,
        activeMenu: 'pastos',
        servidor: process.env.SERVIDOR,
        oper: req.query.oper || 'Cr'
    });
});

module.exports = router;
