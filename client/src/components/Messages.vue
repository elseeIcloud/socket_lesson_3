<template>
  <div>
    <h1>Чат</h1>
    <div>
      <select v-model="selectedRoom" @change="switchRoom">
        <option value="default-room">Общий чат</option>
        <option value="room1">Комната 1</option>
        <option value="room2">Комната 2</option>
        <!-- Добавьте дополнительные комнаты по мере необходимости -->
      </select>
    </div>
    <div>
      <input v-model="message" @keyup.enter="sendMessage" placeholder="Введите сообщение" />
      <button @click="sendMessage">Отправить</button>
    </div>
    <ul>
      <li v-for="msg in messages" :key="msg.id">{{ msg.text }}</li>
    </ul>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  name: 'chat-messages',
  data() {
    return {
      selectedRoom: 'default-room', // Комната по умолчанию
      message: '',
      messages: [],
    };
  },
  computed: {
    roomSocket() {
      // Верните объект сокета для выбранной комнаты
      return this.socketRooms[this.selectedRoom];
    },
  },
  created() {
    this.initializeSocket();
  },
  methods: {
    initializeSocket() {
      this.socketRooms = {};
      const rooms = ['default-room', 'room1', 'room2']; // Добавьте комнаты по мере необходимости

      // Создайте сокет для каждой комнаты
      rooms.forEach((room) => {
        this.socketRooms[room] = io.connect('http://localhost:3000');
        this.socketRooms[room].emit('join room', room);

        this.socketRooms[room].on('chat message', (message) => {
          if (message.room === this.selectedRoom) {
            this.messages.push(message);
          }
        });
      });

      this.selectedRoom = 'default-room'; // Установите комнату по умолчанию
    },
    sendMessage() {
      if (this.message.trim() !== '') {
        const messageObject = {
          id: new Date().toISOString(),
          text: this.message,
          room: this.selectedRoom,
        };
        this.messages.push(messageObject);

        // Отправка сообщения в текущую комнату
        this.roomSocket.emit('chat message', messageObject);

        this.message = '';
      }
    },
    switchRoom() {
      // Переключение на выбранную комнату
      this.roomSocket.emit('join room', this.selectedRoom);
      this.messages = []; // Очистите чат при переключении комнаты
    },
  },
};
</script>
