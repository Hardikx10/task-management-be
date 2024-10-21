import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';

dotenv.config();

const app= express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.DATABASE_URL || '';

mongoose.connect(MONGO_URI)

app.listen(PORT,()=>{
    console.log('server running on port 5000');
    
})
