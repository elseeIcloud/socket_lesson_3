const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const httpServer = http.createServer(app);

app.use(cors({ origin: 'http://localhost:8081' }));

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:8081",
        methods: ["GET", "POST"]
    }
});

// В вашем файле server.js
io.on('connection', (socket) => {
    console.log('Пользователь подключился');

    // Добавьте пользователя в комнату по умолчанию
    socket.join('default-room');

    socket.on('chat message', (data) => {
        // Отправка сообщения в текущую комнату
        io.to(data.room).emit('chat message', data);
    });

    socket.on('join room', (room) => {
        // Покиньте текущую комнату и присоединьтесь к новой
        socket.leaveAll();
        socket.join(room);
    });

    socket.on('disconnect', () => {
        console.log('Пользователь отключился');
    });
});


const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
