const mongoose = require('mongoose');

const DemandeRechercheSchema = new mongoose.Schema({
  nomClient: { type: String, required: true },
  emailClient: { type: String, required: true },
  telephoneClient: { type: String, required: true },
  marqueVehicule: { type: String, required: true },
  modeleVehicule: { type: String, required: true },
  anneeVehicule: { type: Number, required: true },
  vinVehicule: { type: String },
  descriptionPiece: { type: String, required: true },
  statut: { type: String, default: 'Nouveau', enum: ['Nouveau', 'En cours', 'Devis envoyé', 'Clôturé'] },
}, { timestamps: true });

module.exports = mongoose.model('DemandeRecherche', DemandeRechercheSchema);