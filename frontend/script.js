// frontend/script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('demande-form');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (event) => {
        // Empêche le comportement par défaut du formulaire (qui recharge la page)
        event.preventDefault();

        // Récupère les données du formulaire dans un objet
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Affiche un message de chargement (optionnel)
        messageDiv.textContent = 'Envoi en cours...';
        messageDiv.className = '';

        try {
            // Envoie les données au backend avec fetch
            const response = await fetch('http://localhost:3000/api/demandes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                // Si la réponse est positive (ex: statut 201)
                messageDiv.textContent = result.message;
                messageDiv.className = 'success';
                form.reset(); // Vide le formulaire
            } else {
                // Si le serveur renvoie une erreur
                throw new Error(result.message);
            }

        } catch (error) {
            // Si une erreur réseau ou autre se produit
            messageDiv.textContent = error.message || 'Une erreur est survenue. Veuillez réessayer.';
            messageDiv.className = 'error';
        }
    });
});