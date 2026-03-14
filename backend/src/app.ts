import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env, connectDatabase } from './config/index.js';
import { errorHandler } from './middleware/index.js';
import { apiRouter } from './routes/index.js';

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'SistemaBuses API running' });
});

// API routes
app.use('/api', apiRouter);

// Error handler (must be last)
app.use(errorHandler);

// Database connection + server start
connectDatabase().then(() => {
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
});

export default app;
