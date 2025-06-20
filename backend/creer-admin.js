// backend/creer-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// On a besoin du modèle Utilisateur, on va le définir ici
// Dans server.js, on le définira aussi.
const UtilisateurSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, default: 'admin' }
});
const Utilisateur = mongoose.model('Utilisateur', UtilisateurSchema);

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = 'admin@sitepiecesauto.com'; // Changez pour votre email
const ADMIN_PASSWORD = 'site-pieces-auto';  // Changez pour un mot de passe FORT

const creerAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connecté à MongoDB pour créer l'admin.");

        const adminExistant = await Utilisateur.findOne({ email: ADMIN_EMAIL });
        if (adminExistant) {
            console.log("L'utilisateur admin existe déjà.");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const motDePasseHache = await bcrypt.hash(ADMIN_PASSWORD, salt);

        const nouvelAdmin = new Utilisateur({
            email: ADMIN_EMAIL,
            motDePasse: motDePasseHache,
        });

        await nouvelAdmin.save();
        console.log(`Utilisateur admin créé avec succès avec l'email : ${ADMIN_EMAIL}`);

    } catch (error) {
        console.error("Erreur lors de la création de l'admin:", error);
    } finally {
        mongoose.disconnect();
        console.log("Déconnecté de MongoDB.");
    }
};

creerAdmin();