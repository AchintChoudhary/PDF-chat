import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

const app = express();

const PORT = process.env.PORT || 5000;



app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use('/api', documentRoutes);
app.use('/api', chatRoutes);
app.use('/api', historyRoutes);




app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'MERN RAG Document Chatbot API',
    timestamp: new Date().toISOString(),
  });
});



app.use((err, req, res, next) => {
  console.error('API ERROR:', err);

  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : 500;

  res.status(statusCode).json({
    message: err.message || 'Server error',
    stack:
      process.env.NODE_ENV === 'production'
        ? undefined
        : err.stack,
  });
});



const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error('SERVER STARTUP FAILED:', error);
    process.exit(1);
  }
};

startServer();