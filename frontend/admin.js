// frontend/admin.js (version mise à jour)
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    
    // Si pas de token, rediriger immédiatement vers la page de connexion
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const tableBody = document.getElementById('demandes-list');
    const loadingMessage = document.getElementById('loading-message');
    const table = document.getElementById('demandes-table');

    try {
        const response = await fetch('http://localhost:3000/api/demandes', {
            method: 'GET',
            headers: {
                // C'est ici qu'on ajoute le token pour prouver notre identité !
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            // Si le token est invalide ou expiré, on redirige aussi
            localStorage.removeItem('authToken'); // Nettoie le mauvais token
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) { throw new Error(`Erreur HTTP: ${response.status}`); }

        const demandes = await response.json();
        
        // LA MODIFICATION COMMENCE ICI 
        // Vider le tableau
        tableBody.innerHTML = ''; 

        if (demandes.length > 0) {
            demandes.forEach(demande => {
                const row = document.createElement('tr');
                
                const formattedDate = new Date(demande.dateCreation).toLocaleDateString('fr-FR');
                
                // On garde le même début de ligne
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${demande.nomClient}<br><small>${demande.emailClient}</small></td>
                    <td><a href="https://wa.me/${demande.telephoneClient.replace(/\s/g, '')}" target="_blank">${demande.telephoneClient}</a></td>
                    <td>${demande.marqueVehicule} ${demande.modeleVehicule} (${demande.anneeVehicule})</td>
                    <td>${demande.descriptionPiece}</td>
                    <td class="status-cell">
                        <!-- Voici notre menu déroulant ! -->
                        <select class="status-select" data-id="${demande._id}">
                            <option value="Nouveau" ${demande.statut === 'Nouveau' ? 'selected' : ''}>Nouveau</option>
                            <option value="En cours" ${demande.statut === 'En cours' ? 'selected' : ''}>En cours</option>
                            <option value="Devis envoyé" ${demande.statut === 'Devis envoyé' ? 'selected' : ''}>Devis envoyé</option>
                            <option value="Clôturé" ${demande.statut === 'Clôturé' ? 'selected' : ''}>Clôturé</option>
                        </select>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            loadingMessage.textContent = 'Aucune demande pour le moment.';
        }

        // AFFICHER LE TABLEAU
        loadingMessage.style.display = 'none';
        table.style.display = 'table';
        // FIN DES MODIFICATIONS DE GÉNÉRATION

        // ON AJOUTE L'INTERACTIVITÉ
        tableBody.addEventListener('change', async (event) => {
            // On s'assure que l'élément modifié est bien un de nos menus déroulants
            if (event.target.classList.contains('status-select')) {
                const selectElement = event.target;
                const demandeId = selectElement.dataset.id;
                const nouveauStatut = selectElement.value;
                const token = localStorage.getItem('authToken');

                try {
                    const updateResponse = await fetch(`http://localhost:3000/api/demandes/${demandeId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ statut: nouveauStatut })
                    });

                    if (!updateResponse.ok) {
                        throw new Error('La mise à jour a échoué.');
                    }
                    
                    // Petite animation pour montrer que la sauvegarde a réussi
                    selectElement.style.border = '2px solid green';
                    setTimeout(() => { selectElement.style.border = ''; }, 1000);

                } catch (error) {
                    console.error('Erreur de mise à jour:', error);
                    selectElement.style.border = '2px solid red';
                    // On pourrait remettre la valeur précédente en cas d'erreur
                }
            }

            // À ajouter dans admin.js et admin-pieces.js, dans l'événement DOMContentLoaded
            document.getElementById('logout-button').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
            });
        });

    } catch (error) {
        console.error('Erreur:', error);
        loadingMessage.textContent = 'Erreur de chargement. Redirection...';
        localStorage.removeItem('authToken');
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    }
});