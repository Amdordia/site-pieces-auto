document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('pieces-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    let allPieces = [];

    // Fonction pour afficher les pièces dans la grille
    const displayPieces = (piecesToDisplay) => {

        grid.innerHTML = ''; // Vide la grille

        if (piecesToDisplay.length === 0) {
            grid.innerHTML = `<p>Aucune pièce ne correspond à votre recherche.</p>`;
            return;
        }
        
        piecesToDisplay.forEach(piece => {
            const card = document.createElement('div');
            card.className = 'piece-card';

            const imageContent = piece.imageUrl
                ? `<img src="http://localhost:3000/${piece.imageUrl}" alt="${piece.nom}" class="card-img-top">`
                : `<span>Image bientôt disponible</span>`;

            card.innerHTML = `
                <div class="card-image">${imageContent}</div>
                <div class="card-content">
                    <h3 class="card-title">${piece.nom}</h3>
                    <p class="card-category">Catégorie : ${piece.categorie}</p>
                    <div class="card-footer">
                        <span class="card-price">${piece.prix.toFixed(2)} FCFA</span>
                        <a href="produit.html?id=${piece._id}" class="card-button">Voir détails</a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    // Fonction pour appliquer les filtres
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        let filteredPieces = allPieces;

        // 1. Filtrer par nom
        if (searchTerm) {
            filteredPieces = filteredPieces.filter(p => 
                p.nom.toLowerCase().includes(searchTerm) || 
                (p.reference && p.reference.toLowerCase().includes(searchTerm))
            );
        }

        // 2. Filtrer par catégorie
        if (selectedCategory) {
            filteredPieces = filteredPieces.filter(p => p.categorie === selectedCategory);
        }
        
        displayPieces(filteredPieces);
    };
    
    // Charger toutes les pièces depuis l'API publique
    const loadPieces = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/pieces/public');
            if (!response.ok) throw new Error('Erreur de chargement des données.');
            
            allPieces = await response.json();
            displayPieces(allPieces); // Afficher tout au début
        } catch (error) {
            console.error(error);
            grid.innerHTML = `<p>Impossible de charger le catalogue. Veuillez réessayer plus tard.</p>`;
        }
    };

    // Ajout des écouteurs d'événements
    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    
    // Chargement initial
    loadPieces();
});