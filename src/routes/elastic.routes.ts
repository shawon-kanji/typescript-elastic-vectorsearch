import express from 'express';
import { ElasticService } from '../services/elastic.service';
import { embeddingModelNameList } from '../config/embedding_model';

const router = express.Router();
const elasticService = new ElasticService();

// Route to ingest data
router.post('/ingest', async (req, res) => {
    try {
        const result = await elasticService.ingestData(req.body.embeddingName || embeddingModelNameList['all-MiniLM-L6-v2']);
        res.status(200).json({
            status: 'success',
            message: 'Data ingested successfully',
            result
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to ingest data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to search documents
router.get('/vector-search', async (req, res) => {
    try {
        const { query } = req.query;

        const modelName = req.query.modelName || embeddingModelNameList['all-MiniLM-L6-v2']

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Query parameter is required and must be a string'
            });
        }

        const results = await elasticService.vectorSearch(query,modelName as embeddingModelNameList);
        res.status(200).json({
            status: 'success',
            results
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to search documents',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
