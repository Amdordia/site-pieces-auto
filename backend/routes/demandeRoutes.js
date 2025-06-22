const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createDemande,
    getAllDemandes,
    updateStatutDemande
} = require('../controllers/demandeController');

// Route publique pour que n'importe qui puisse créer une demande
router.post('/', createDemande);

// Routes privées pour l'admin pour gérer les demandes
router.get('/', protect, getAllDemandes);
router.patch('/:id', protect, updateStatutDemande);

module.exports = router;