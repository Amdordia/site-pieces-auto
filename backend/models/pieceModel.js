const mongoose = require('mongoose');

const PieceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    reference: { type: String },
    prix: { type: Number, required: true },
    categorie: { type: String, required: true },
    description: { type: String },
    compatibilite: { type: String },
    imageUrl: { type: String }
}, { timestamps: true }); // Ajoute createdAt et updatedAt automatiquement

module.exports = mongoose.model('Piece', PieceSchema);