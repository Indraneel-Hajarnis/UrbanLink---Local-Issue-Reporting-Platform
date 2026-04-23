import express from 'express';
const app = express();
const PORT = 5001;

app.get('/', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
