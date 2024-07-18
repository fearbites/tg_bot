// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5173;

app.use(bodyParser.json());
app.use(cors());

let userPoints = {}; // временное хранилище для очков пользователей

app.get('/api/points/:userId', (req, res) => {
  const userId = req.params.userId;
  const points = userPoints[userId] || 0;
  res.json({ points });
});

app.post('/api/points/:userId', (req, res) => {
  const userId = req.params.userId;
  const { points } = req.body;
  userPoints[userId] = points;
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
