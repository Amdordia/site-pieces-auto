const Piece = require('../models/pieceModel');

// @desc   Créer une nouvelle pièce
// @route  POST /api/pieces
// @access Privé (Admin)
exports.createPiece = async (req, res) => {
    try {
        const pieceData = req.body;
        if (req.file) {
            pieceData.imageUrl = `uploads/${req.file.filename}`;
        }
        const nouvellePiece = new Piece(pieceData);
        const pieceSauvegardee = await nouvellePiece.save();
        res.status(201).json(pieceSauvegardee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc   Récupérer toutes les pièces (pour le catalogue public)
// @route  GET /api/pieces/public
// @access Public
exports.getPublicPieces = async (req, res) => {
    try {
        const pieces = await Piece.find().sort({ nom: 1 });
        res.json(pieces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Récupérer une seule pièce par ID (pour la page produit)
// @route  GET /api/pieces/public/:id
// @access Public
exports.getPublicPieceById = async (req, res) => {
    try {
        const piece = await Piece.findById(req.params.id);
        if (piece) {
            res.json(piece);
        } else {
            res.status(404).json({ message: 'Pièce non trouvée' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Récupérer toutes les pièces (pour l'admin)
// @route  GET /api/pieces
// @access Privé (Admin)
exports.getAdminPieces = async (req, res) => {
     try {
        const pieces = await Piece.find().sort({ nom: 1 });
        res.json(pieces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Mettre à jour une pièce
// @route  PUT /api/pieces/:id
// @access Privé (Admin)
exports.updatePiece = async (req, res) => {
    try {
        const pieceData = req.body;
        if (req.file) {
            pieceData.imageUrl = `uploads/${req.file.filename}`;
        }
        const pieceMiseAJour = await Piece.findByIdAndUpdate(req.params.id, pieceData, { new: true });
        if (!pieceMiseAJour) return res.status(404).json({ message: 'Pièce non trouvée' });
        res.json(pieceMiseAJour);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc   Supprimer une pièce
// @route  DELETE /api/pieces/:id
// @access Privé (Admin)
exports.deletePiece = async (req, res) => {
    try {
        const piece = await Piece.findByIdAndDelete(req.params.id);
        if (!piece) return res.status(404).json({ message: 'Pièce non trouvée' });
        res.json({ message: 'Pièce supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};