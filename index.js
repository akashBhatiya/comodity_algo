import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const corsOptions = {
	origin: process.env.CORS_ORIGIN,
	methods: '*',
	credentials: true,
};

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: corsOptions
});
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(express.json());





io.on('connection', (socket) => {
	console.log('A user connected:', socket.id);

	socket.on('message', (data) => {
		console.log('Message received:', data);
		io.emit('message', data);
	});

	socket.on('disconnect', () => {
		console.log('User disconnected:', socket.id);
	});
});

app.get('/', (req, res) => {
	res.send('Hello, ES6 with Express!');
});

httpServer.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
