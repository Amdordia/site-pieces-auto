// frontend/admin-pieces.js (VERSION CORRIGÉE ET OPTIMISÉE)

document.addEventListener('DOMContentLoaded', () => {
    // --- Sécurité et Déconnexion ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });

    // --- Références au DOM ---
    const form = document.getElementById('add-piece-form');
    const formTitle = document.querySelector('#add-piece-section h2');
    const formButton = form.querySelector('button[type="submit"]');
    const piecesList = document.getElementById('pieces-list');
    const formMessage = document.getElementById('form-message');
    
    // --- FIX 1 : Déclarer la référence au bouton "Annuler" ---
    const cancelButton = document.getElementById('cancel-edit-btn'); 

    // --- Variables d'état ---
    let currentlyEditingId = null;
    // --- AMÉLIORATION : Variable pour stocker les pièces localement ---
    let allPieces = []; 

    // --- Fonction pour charger et afficher les pièces ---
    const loadPieces = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/pieces', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erreur de chargement');
            
            // --- AMÉLIORATION : Stocker les pièces dans notre variable locale ---
            allPieces = await response.json(); 
            
            piecesList.innerHTML = '';
            
            allPieces.forEach(piece => { // On utilise maintenant allPieces
                const row = document.createElement('tr');
                row.dataset.pieceId = piece._id;
                row.innerHTML = `
                    <td>${piece.nom}</td>
                    <td>${piece.reference || '-'}</td>
                    <td>${piece.prix.toFixed(2)} FCFA</td>
                    <td>${piece.categorie}</td>
                    <td>
                        <button class="edit-btn">Modifier</button> 
                        <button class="delete-btn">Supprimer</button>
                    </td>
                `;
                piecesList.appendChild(row);
            });
        } catch (error) {
            console.error('Erreur:', error);
            piecesList.innerHTML = `<tr><td colspan="5">Impossible de charger les pièces.</td></tr>`;
        }
    };

    // --- Logique d'envoi du formulaire (Création ou Mise à jour) ---
    // (Cette fonction reste identique, elle était déjà parfaite)
    // Remplacez la fonction de gestion du formulaire dans admin-pieces.js
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. On utilise FormData au lieu d'un objet JSON
        const formData = new FormData();
        
        // 2. On ajoute chaque champ au formData
        formData.append('nom', document.getElementById('nom').value);
        formData.append('reference', document.getElementById('reference').value);
        formData.append('prix', document.getElementById('prix').value);
        // ... ajoutez tous vos autres champs de texte de la même manière ...
        formData.append('description', document.getElementById('description').value);
        formData.append('compatibilite', document.getElementById('compatibilite').value);
        formData.append('categorie', document.getElementById('categorie').value);
        
        // On ajoute l'image SEULEMENT si un fichier a été sélectionné
        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const method = currentlyEditingId ? 'PUT' : 'POST';
        const url = currentlyEditingId 
            ? `http://localhost:3000/api/pieces/${currentlyEditingId}`
            : 'http://localhost:3000/api/pieces';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    // ATTENTION: PAS de 'Content-Type'. Le navigateur le mettra pour nous.
                    'Authorization': `Bearer ${token}`
                },
                body: formData // On envoie l'objet FormData
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Erreur serveur');
            
            formMessage.textContent = currentlyEditingId ? 'Pièce modifiée avec succès !' : 'Pièce ajoutée avec succès !';
            formMessage.className = 'success';
            
            resetForm();
            await loadPieces();
        } catch (error) {
            formMessage.textContent = error.message;
            formMessage.className = 'error';
        }
    });

    // -- Ajoutez la logique de prévisualisation --
    document.getElementById('image').addEventListener('change', (event) => {
        const preview = document.getElementById('image-preview');
        const file = event.target.files[0];
        if (file) {
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
        }
    });
    
    // --- FIX 2 : Définir le listener pour le bouton Annuler ICI, une seule fois ---
    cancelButton.addEventListener('click', resetForm);

    // --- Logique pour les boutons Modifier et Supprimer (Délégation d'événements) ---
    piecesList.addEventListener('click', async (e) => {
        const target = e.target;
        if (!target.classList.contains('edit-btn') && !target.classList.contains('delete-btn')) return; // Optimisation : sortir si on ne clique pas sur un bouton

        const row = target.closest('tr');
        const pieceId = row.dataset.pieceId;
        
        if (target.classList.contains('delete-btn')) {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette pièce ?')) {
                try {
                    await fetch(`http://localhost:3000/api/pieces/${pieceId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    await loadPieces();
                } catch (error) {
                    alert("La suppression a échoué.");
                }
            }
        }

        if (target.classList.contains('edit-btn')) {
            // --- AMÉLIORATION : Chercher dans la variable locale, pas sur le serveur ---
            const pieceToEdit = allPieces.find(p => p._id === pieceId);
            
            if (pieceToEdit) {
                document.getElementById('nom').value = pieceToEdit.nom;
                document.getElementById('reference').value = pieceToEdit.reference || '';
                document.getElementById('prix').value = pieceToEdit.prix;
                document.getElementById('categorie').value = pieceToEdit.categorie;
                document.getElementById('compatibilite').value = pieceToEdit.compatibilite || '';
                document.getElementById('description').value = pieceToEdit.description || '';

                currentlyEditingId = pieceId;
                formTitle.textContent = 'Modifier une pièce';
                formButton.textContent = 'Mettre à jour la pièce';
                cancelButton.style.display = 'inline-block';
                form.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
    
    // --- Fonction pour réinitialiser le formulaire ---
    function resetForm() {
        form.reset();
        document.getElementById('image-preview').style.display = 'none'; // Cacher la preview
        currentlyEditingId = null;
        formTitle.textContent = 'Ajouter une nouvelle pièce';
        formButton.textContent = 'Ajouter la Pièce';
        cancelButton.style.display = 'none';
        setTimeout(() => formMessage.textContent = '', 3000);
    }
    
    // --- Chargement initial ---
    loadPieces();
});