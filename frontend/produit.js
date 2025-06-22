document.addEventListener('DOMContentLoaded', async () => {
    const productContainer = document.getElementById('product-detail-container');
    const loadingMessage = document.getElementById('loading-message');

    // Étape 1 : Récupérer l'ID de la pièce depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const pieceId = params.get('id');

    if (!pieceId) {
        loadingMessage.textContent = "Aucune pièce sélectionnée. Retour au catalogue.";
        setTimeout(() => { window.location.href = 'catalogue.html'; }, 2000);
        return;
    }

    try {
        // Étape 2 : Appeler l'API pour récupérer les données de cette pièce
        const response = await fetch(`http://localhost:3000/api/pieces/public/${pieceId}`);
        
        if (!response.ok) {
            // Si la pièce n'existe pas (404) ou autre erreur
            throw new Error('Pièce non trouvée.');
        }
        
        const piece = await response.json();

        // Étape 3 : Mettre à jour la page avec les données reçues
        document.title = piece.nom; // Met à jour le titre de l'onglet du navigateur
        loadingMessage.style.display = 'none'; // Cache le message de chargement

        const imageContent = piece.imageUrl
        ? `<img src="http://localhost:3000/${piece.imageUrl}" alt="${piece.nom}" style="width: 100%; height: auto; border-radius: 8px;">`
        : `<span>Image de la pièce</span>`;
        
        productContainer.innerHTML = `
            <div class="product-image-gallery">${imageContent}</div>
            <div class="product-info">
                <span class="category">Catégorie : ${piece.categorie}</span>
                <h1 id="piece-nom">${piece.nom}</h1>
                ${piece.reference ? `<span class="reference">Référence : ${piece.reference}</span>` : ''}

                <div class="price">${piece.prix.toFixed(2)} FCFA</div>
                
                <div class="description">
                    <h3>Description</h3>
                    <p>${piece.description || 'Pas de description disponible.'}</p>
                </div>

                ${piece.compatibilite ? `
                    <div class="description">
                        <h3>Compatibilité</h3>
                        <p>${piece.compatibilite}</p>
                    </div>
                ` : ''}

                <a href="#" class="add-to-cart-btn">Contacter pour acheter</a>
            </div>
        `;
        productContainer.style.display = 'grid'; // Affiche le conteneur

    } catch (error) {
        console.error(error);
        loadingMessage.textContent = "Désolé, cette pièce n'a pas pu être trouvée.";
    }
});