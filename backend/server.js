// backend/server.js (VERSION CORRIGÉE ET FINALE)

// 1. Importations
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// --- À ajouter après les importations initiales ---
const path = require('path'); // Module natif de Node.js pour gérer les chemins de fichiers
const multer = require('multer'); // Pour gérer l'upload de fichiers

// 2. Initialisation
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middlewares
app.use(cors());
app.use(express.json());
// --- Juste après app.use(express.json());, servez le dossier 'uploads' ---
// Cette ligne rend les images du dossier 'uploads' accessibles publiquement
// via une URL comme http://localhost:3000/uploads/image.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Configuration de Multer pour le stockage des fichiers ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Le dossier où les images seront sauvegardées
    },
    filename: (req, file, cb) => {
        // Crée un nom de fichier unique pour éviter les conflits
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// 4. Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {}) // Les options useNewUrlParser/UnifiedTopology sont dépréciées mais pas besoin de les enlever pour l'instant
.then(() => console.log("Connexion à MongoDB réussie !"))
.catch(err => console.error("Erreur de connexion à MongoDB:", err));

// =========================================================
// 7. DÉFINITION GLOBALE DES MODÈLES DE DONNÉES
// =========================================================

// Modèle pour une Demande de Recherche
const DemandeRechercheSchema = new mongoose.Schema({
  nomClient: { type: String, required: true },
  emailClient: { type: String, required: true },
  telephoneClient: { type: String, required: true },
  marqueVehicule: { type: String, required: true },
  modeleVehicule: { type: String, required: true },
  anneeVehicule: { type: Number, required: true },
  vinVehicule: { type: String },
  descriptionPiece: { type: String, required: true },
  statut: { type: String, default: 'Nouveau' },
  dateCreation: { type: Date, default: Date.now },
});
const DemandeRecherche = mongoose.model('DemandeRecherche', DemandeRechercheSchema);

// Modèle pour un Utilisateur (admin)
const UtilisateurSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, default: 'admin' }
});
const Utilisateur = mongoose.model('Utilisateur', UtilisateurSchema);

// Modèle pour une Pièce du catalogue
const PieceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    reference: { type: String },
    prix: { type: Number, required: true },
    categorie: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String }, // On ajoute le champ pour l'image
    // On garde la compatibilité simple pour l'instant
    compatibilite: { type: String }
});
const Piece = mongoose.model('Piece', PieceSchema);

// =========================================================
// MIDDLEWARE ET ROUTES
// =========================================================

// --- Middleware d'authentification ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Accès non autorisé : token manquant' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Accès interdit : token invalide' });
    req.user = user;
    next();
  });
};

// --- Route publique pour créer une demande ---
app.post('/api/demandes', async (req, res) => {
  try {
    const nouvelleDemande = new DemandeRecherche(req.body);
    const demandeSauvegardee = await nouvelleDemande.save();
    res.status(201).json({ 
      message: 'Votre demande a été envoyée avec succès !',
      demande: demandeSauvegardee 
    });
  } catch (error) {
    console.error("Erreur lors de la création de la demande:", error);
    res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' });
  }
});

// --- Route publique pour la connexion ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    // Maintenant, cette ligne fonctionne car 'Utilisateur' est défini globalement !
    const utilisateur = await Utilisateur.findOne({ email });
    
    if (!utilisateur) return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    
    const estValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!estValide) return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    
    const token = jwt.sign(
      { id: utilisateur._id, email: utilisateur.email, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error("Erreur dans /api/auth/login:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// ************ NOUVELLE ROUTE PUBLIQUE CI-DESSOUS ************
// --- Route publique pour récupérer toutes les pièces pour les clients ---
app.get('/api/public/pieces', async (req, res) => {
  try {
    // La logique est la même que la route admin, mais sans 'authMiddleware'
    const pieces = await Piece.find().sort({ nom: 1 });
    res.status(200).json(pieces);
  } catch (error) {
    console.error("Erreur récupération pièces publiques:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});
// ***************************************************************

// --- Route publique pour récupérer UNE SEULE pièce par son ID ---
app.get('/api/public/pieces/:id', async (req, res) => {
  try {
    const { id } = req.params; // Récupère l'ID depuis l'URL

    // Vérifie si l'ID est un ID MongoDB valide pour éviter les erreurs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Pièce non trouvée." });
    }
    
    const piece = await Piece.findById(id);

    if (!piece) {
      return res.status(404).json({ message: "Pièce non trouvée." });
    }
    
    res.status(200).json(piece);
    
  } catch (error) {
    console.error("Erreur récupération pièce unique:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- Route protégée pour voir toutes les demandes ---
app.get('/api/demandes', authMiddleware, async (req, res) => {
  try {
    const demandes = await DemandeRecherche.find().sort({ dateCreation: -1 });
    res.status(200).json(demandes);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- Route protégée pour METTRE À JOUR le statut d'une demande ---
// On utilise :id pour cibler une demande spécifique par son identifiant unique.
app.patch('/api/demandes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params; // Récupère l'ID depuis l'URL
    const { statut } = req.body; // Récupère le nouveau statut depuis le corps de la requête

    // Vérifie si le statut envoyé est une valeur valide
    const statutsValides = ['Nouveau', 'En cours', 'Devis envoyé', 'Clôturé'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    // Trouve la demande par son ID et met à jour son statut
    // { new: true } renvoie le document mis à jour, sinon il renvoie l'ancien.
    const demandeMiseAJour = await DemandeRecherche.findByIdAndUpdate(
      id, 
      { statut: statut }, 
      { new: true }
    );

    if (!demandeMiseAJour) {
      return res.status(404).json({ message: 'Demande non trouvée.' });
    }

    res.status(200).json(demandeMiseAJour); // Renvoie la demande mise à jour

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la demande:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- Route protégée pour CRÉER une nouvelle pièce ---
// -- Remplacez votre route POST --
app.post('/api/pieces', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const pieceData = req.body;
    if (req.file) {
        // Important : On stocke le chemin relatif accessible via le web
        pieceData.imageUrl = `uploads/${req.file.filename}`;
    }
    const nouvellePiece = new Piece(pieceData);
    const pieceSauvegardee = await nouvellePiece.save();
    res.status(201).json(pieceSauvegardee);
  } catch (error) { /* ... */ }
});

// --- Route protégée pour RÉCUPÉRER toutes les pièces ---
app.get('/api/pieces', authMiddleware, async (req, res) => {
  try {
    const pieces = await Piece.find().sort({ nom: 1 }); // Tri par nom
    res.status(200).json(pieces);
  } catch (error) {
    console.error("Erreur récupération pièces:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// --- Route protégée pour METTRE À JOUR une pièce ---
// -- Remplacez votre route PUT --
app.put('/api/pieces/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const pieceData = req.body;
        if (req.file) {
            pieceData.imageUrl = `uploads/${req.file.filename}`;
        }
        const pieceMiseAJour = await Piece.findByIdAndUpdate(id, pieceData, { new: true });
        // J'ajoute une petite vérification ici, c'est plus robuste
        if (!pieceMiseAJour) return res.status(404).json({ message: "Pièce non trouvée." });
    
        res.status(200).json(pieceMiseAJour);

  } catch (error) {
    console.error("Erreur MàJ pièce:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// --- Route protégée pour SUPPRIMER une pièce ---
app.delete('/api/pieces/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const pieceSupprimee = await Piece.findByIdAndDelete(id);

    if (!pieceSupprimee) return res.status(404).json({ message: "Pièce non trouvée." });

    res.status(200).json({ message: "Pièce supprimée avec succès." });

  } catch (error) {
    console.error("Erreur suppression pièce:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 7. Démarrage du serveur
app.listen(PORT, () => {
  // J'ai corrigé une petite faute de syntaxe ici aussi (il manquait les backticks ``)
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});