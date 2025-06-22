const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            // Récupère le token de l'en-tête "Bearer <token>"
            token = authHeader.split(' ')[1];

            // Vérifie le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // On peut ajouter l'utilisateur décodé à la requête pour un usage ultérieur
            req.user = decoded; 
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Non autorisé, pas de token' });
    }
};

module.exports = { protect };