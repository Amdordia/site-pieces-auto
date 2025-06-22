const mongoose = require('mongoose');

const UtilisateurSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, default: 'admin', enum: ['admin'] }
});

module.exports = mongoose.model('Utilisateur', UtilisateurSchema);