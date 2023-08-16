const socket = io('http://localhost:8085');

// Get DOM elements in respective Js variables
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
var audio = new Audio('ting.mp3');
let nameInput = ''; // Variable to store the user's entered name

// Function which will append event info to the container
const append = (message, position, isOwnMessage) => {
    if (isOwnMessage && position === 'left') {
        return; // Skip appending your own message when received as others' messages
    }

    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);

    if (position === 'left') {
        if (isOwnMessage) {
            messageElement.classList.add('own-left-message'); // Add own-left-message class to your "left the chat" messages
        }
        audio.play();
    }

    if (isOwnMessage) {
        messageElement.classList.add('own-message'); // Add own-message class to your messages
    } else {
        messageElement.classList.add('user-message'); // Add user-message class to others' messages
    }

    messageContainer.append(messageElement);

    // Scroll to the bottom when a new message is appended
    messageContainer.scrollTop = messageContainer.scrollHeight;
};

// Ask new user for his/her name and let the server know
const joinChat = () => {
    nameInput = prompt('Enter your name to join');
    if (!nameInput || nameInput.trim() === '') {
        alert('Please provide a valid name to join the chat.');
        joinChat(); // Ask for the name again until it's valid
        return;
    }
    socket.emit('new-user-joined', nameInput);
};

// If server sends a welcome message, receive it
socket.on('welcome-message', (message) => {
    append(message, 'right', true); // Display the welcome message as the user's own message
});

// If a new user joins, receive his/her name from the server
socket.on('user-joined', (name) => {
    if (name !== nameInput) {
        // Check if it's not the current user's own name
        append(`${name} joined the chat`, 'right');
    }
});

// If server sends a message, receive it
socket.on('receive', (data) => {
    const isOwnMessage = data.name === nameInput; // Check if it's the user's own message
    append(`${data.name}: ${data.message}`, 'left', isOwnMessage);
});

// If a user leaves the chat, append the info to the container
socket.on('left', (name) => {
    const leftUserName = `${name} left the chat`;
    append(leftUserName, 'right');
});

socket.on('not-joined', (message) => {
    alert(message); // Display an alert if the user sends a message before joining the chat
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message.trim() !== '') {
        append(`You: ${message}`, 'right', true);
        socket.emit('send', message);
        messageInput.value = ''; // Clear message input after sending
    }
});

// Ask new user for his/her name and let the server know
joinChat();
