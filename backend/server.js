require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// --- Importation de toutes nos Routes ---
const pieceRoutes = require('./routes/pieceRoutes');
const demandeRoutes = require('./routes/demandeRoutes'); 
const authRoutes = require('./routes/authRoutes');

// --- Connexion à la BDD (elle doit se faire avant tout le reste) ---
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(err => console.error("Erreur de connexion à MongoDB:", err));

// --- Initialisation de l'application Express ---
const app = express();

// --- Configuration des Middlewares ---
app.use(cors());
app.use(express.json()); // Pour comprendre le JSON
app.use(express.urlencoded({ extended: false })); // Pour comprendre les formulaires web

// --- Rendre le dossier 'uploads' accessible publiquement ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Définition des Points d'Entrée API ---
app.use('/api/pieces', pieceRoutes);
app.use('/api/demandes', demandeRoutes);
app.use('/api/auth', authRoutes);

// --- Lancement du Serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`);
});