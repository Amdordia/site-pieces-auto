// frontend/login.js
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const motDePasse = document.getElementById('motDePasse').value;
    const messageDiv = document.getElementById('login-message');

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, motDePasse })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        // Si la connexion réussit, le token est dans data.token
        localStorage.setItem('authToken', data.token);
        // Redirige vers la page d'administration
        window.location.href = 'admin.html'; 

    } catch (error) {
        messageDiv.textContent = error.message;
        messageDiv.className = 'error';
    }
});