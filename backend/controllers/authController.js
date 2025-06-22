const Utilisateur = require('../models/utilisateurModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Connecter un utilisateur (admin)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;
        
        // Vérifier si l'utilisateur existe
        const utilisateur = await Utilisateur.findOne({ email });
        if (!utilisateur) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const estValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
        if (!estValide) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer et renvoyer le token
        const token = jwt.sign(
            { id: utilisateur._id, role: utilisateur.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token });
    } catch (error) {
        console.error("Erreur de connexion:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};