const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    createPiece,
    getPublicPieces,
    getPublicPieceById,
    getAdminPieces,
    updatePiece,
    deletePiece
} = require('../controllers/pieceController');

// --- Routes Publiques ---
// NOTE : Il est préférable d'avoir une route séparée pour le public
router.get('/public', getPublicPieces);
router.get('/public/:id', getPublicPieceById);

// --- Routes Admin ---
router.route('/')
    .post(protect, upload.single('image'), createPiece)
    .get(protect, getAdminPieces);
    
router.route('/:id')
    .put(protect, upload.single('image'), updatePiece)
    .delete(protect, deletePiece);

module.exports = router;