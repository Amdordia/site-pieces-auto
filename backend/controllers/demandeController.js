const DemandeRecherche = require('../models/demandeModel');

// @desc    Créer une nouvelle demande de recherche
// @route   POST /api/demandes
// @access  Public
exports.createDemande = async (req, res) => {
    try {
        const nouvelleDemande = new DemandeRecherche(req.body);
        const demandeSauvegardee = await nouvelleDemande.save();
        res.status(201).json({ 
            message: 'Votre demande a été envoyée avec succès !',
            demande: demandeSauvegardee 
        });
    } catch (error) {
        console.error("Erreur création demande:", error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Récupérer toutes les demandes (pour l'admin)
// @route   GET /api/demandes
// @access  Privé (Admin)
exports.getAllDemandes = async (req, res) => {
    try {
        const demandes = await DemandeRecherche.find().sort({ createdAt: -1 });
        res.json(demandes);
    } catch (error) {
        console.error("Erreur récupération demandes:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mettre à jour le statut d'une demande
// @route   PATCH /api/demandes/:id
// @access  Privé (Admin)
exports.updateStatutDemande = async (req, res) => {
    try {
        const { statut } = req.body;
        // La validation est maintenant dans le modèle avec 'enum'
        const demandeMiseAJour = await DemandeRecherche.findByIdAndUpdate(
            req.params.id, 
            { statut }, 
            { new: true, runValidators: true }
        );
        if (!demandeMiseAJour) {
            return res.status(404).json({ message: 'Demande non trouvée' });
        }
        res.json(demandeMiseAJour);
    } catch (error) {
        console.error("Erreur MàJ demande:", error);
        res.status(400).json({ message: error.message });
    }
};