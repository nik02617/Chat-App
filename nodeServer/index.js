const express = require('express');
const app = express();
const http = require('http').createServer(app); // Use http.createServer to create a server instance
const io = require('socket.io')(http, {
  cors: {
    origin: ["http://127.0.0.1:5500", "http://localhost:8085"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true
  }
});

const users = {};

io.on('connection', socket => {
    // If any new user joins, let other users connected to the server know!
  socket.on('new-user-joined', name => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        socket.emit('invalid-name', 'Invalid name. Please provide a valid name to join the chat.');
        return;
      }
  
      const lowerCaseName = name.toLowerCase(); // Convert the name to lowercase for case-insensitive check
  
      // Check if the name is already taken by another user
      const isNameTaken = Object.values(users).some(existingName => existingName.toLowerCase() === lowerCaseName);
  
      if (isNameTaken) {
        socket.emit('invalid-name', 'Username already taken. Please choose a different name.');
        return;
      }
  
    users[socket.id] = name;
    socket.emit('welcome-message', `Welcome, ${name}! You have joined the chat.`);
    socket.broadcast.emit('user-joined', name);
    });

   // If someone sends a message, broadcast it to other people
   socket.on('send', message => {
    const senderName = users[socket.id];
    if (senderName) {
      io.emit('receive', { message: message, name: senderName });
    } else {
      socket.emit('not-joined', 'You cannot send messages before joining the chat.');
    }
  });

  // If someone leaves the chat, let others know
  socket.on('disconnect', () => {
    const leftUserName = users[socket.id];
    if (leftUserName) {
      io.emit('left', `${leftUserName} left the chat`);
      delete users[socket.id];
    }
  });
});

http.listen(8085, () => 
  console.log('Server running on port 8085')
);
