const express = require('express');

const app = express();
const PORT = 3000;

// Middleware JSON
app.use(express.json());

// Route d'accueil
app.get('/', (req, res) => {
    res.send('Bonjour depuis Express.js !');
});

// Route API exemple
app.get('/api/hello', (req, res) => {
    res.json({
        message: 'Hello World'
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});