document.addEventListener('DOMContentLoaded', () => {
    const featuredGrid = document.getElementById('featured-pieces-grid');

    const loadFeaturedPieces = async () => {
        try {
            // On utilise la même API publique que pour le catalogue
            const response = await fetch('http://localhost:3000/api/pieces/public');
            if (!response.ok) throw new Error('Erreur de chargement');
            
            let allPieces = await response.json();
            // On prend seulement les 3 premières pièces pour la page d'accueil
            let featuredPieces = allPieces.slice(0, 3);
            
            if (featuredPieces.length === 0) {
                featuredGrid.innerHTML = "<p>Notre catalogue est en cours de construction...</p>";
                return;
            }

            featuredGrid.innerHTML = ''; // Vide la grille
            
            featuredPieces.forEach(piece => {
                const card = document.createElement('div');
                card.className = 'piece-card'; // On réutilise le style de carte du catalogue !
                const imageContent = piece.imageUrl
                ? `<img src="http://localhost:3000/${piece.imageUrl}" alt="${piece.nom}" class="card-img-top">`
                : `<span>Image bientôt disponible</span>`;
                card.innerHTML = `
                    <div class="card-image">${imageContent}</div>
                    <div class="card-content">
                        <h3 class="card-title">${piece.nom}</h3>
                        <p class="card-category">${piece.categorie}</p>
                        <div class="card-footer">
                            <span class="card-price">${piece.prix.toFixed(2)} FCFA</span>
                            <a href="produit.html?id=${piece._id}" class="card-button">Voir détails</a>
                        </div>
                    </div>
                `;
                featuredGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Erreur:', error);
            featuredGrid.innerHTML = '<p>Impossible de charger les pièces en vedette pour le moment.</p>';
        }
    };
    
    // Charger les pièces au chargement de la page
    loadFeaturedPieces();
});