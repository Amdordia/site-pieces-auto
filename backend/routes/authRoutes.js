const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// La seule route ici est pour le login
router.post('/login', loginUser);

module.exports = router;