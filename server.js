const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

const BOT_TOKEN = process.env.BOT_TOKEN; // Загрузка токена из переменной окружения
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

let users = {}; // Простая база данных в памяти для хранения прогресса пользователей

app.use(express.json());

app.post('/auth/telegram', async (req, res) => {
    const { hash, id, ...userData } = req.body;

    // Проверка подписи
    const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
    const checkString = Object.keys(userData)
        .sort()
        .map(key => `${key}=${userData[key]}`)
        .join('\n');
    const hmac = crypto.createHmac('sha256', secretKey)
        .update(checkString)
        .digest('hex');

    if (hmac !== hash) {
        return res.status(401).send('Unauthorized');
    }

    // Сохраняем пользователя и его прогресс
    if (!users[id]) {
        users[id] = { points: 0, energy: 6500 };
    }

    res.send({ id, ...users[id] });
});

app.post('/updateProgress', (req, res) => {
    const { userId, points, energy } = req.body;
    if (users[userId]) {
        users[userId].points = points;
        users[userId].energy = energy;
        res.send('Progress updated');
    } else {
        res.status(404).send('User not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
