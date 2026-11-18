var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('piquetes/vwLstPiquetes', {
        title: 'Piquetes',
        showNavbar: true,
        activeMenu: 'piquetes',
        servidor: process.env.SERVIDOR
    });
});

router.get('/form', function(req, res) {
    res.render('piquetes/vwFormPiquetes', {
        title: 'Formulário de piquetes',
        showNavbar: true,
        activeMenu: 'piquetes',
        servidor: process.env.SERVIDOR,
        oper: req.query.oper || 'Cr'
    });
});

module.exports = router;
