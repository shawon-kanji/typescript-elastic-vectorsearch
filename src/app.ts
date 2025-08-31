import express from 'express';
import dotenv from 'dotenv';
import elasticRoutes from './routes/elastic.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Register routes
app.use('/api', elasticRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
