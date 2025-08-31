"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const elastic_service_1 = require("../services/elastic.service");
const embedding_model_1 = require("../config/embedding_model");
const router = express_1.default.Router();
const elasticService = new elastic_service_1.ElasticService();
// Route to ingest data
router.post('/ingest', async (req, res) => {
    try {
        const result = await elasticService.ingestData(req.body.embeddingName || embedding_model_1.embeddingModelNameList['all-MiniLM-L6-v2']);
        res.status(200).json({
            status: 'success',
            message: 'Data ingested successfully',
            result
        });
    }
    catch (error) {
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
        const modelName = req.query.modelName || embedding_model_1.embeddingModelNameList['all-MiniLM-L6-v2'];
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Query parameter is required and must be a string'
            });
        }
        const results = await elasticService.vectorSearch(query, modelName);
        res.status(200).json({
            status: 'success',
            results
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to search documents',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=elastic.routes.js.map