"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticService = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv_1 = __importDefault(require("dotenv"));
const transformers_1 = require("@huggingface/transformers");
const config_1 = require("../config");
dotenv_1.default.config();
const books = config_1.config.books;
class ElasticService {
    client;
    constructor() {
        this.client = new elasticsearch_1.Client({
            node: 'http://localhost:9200',
            auth: {
                apiKey: process.env.ELASTIC_SEARCH_API_KEY || ''
            }
        });
    }
    async getEmbedding(input) {
        const extractor = await (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        return await extractor(input, { pooling: 'mean', normalize: true });
    }
    async ingestData() {
        const extractor = await (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const documentsWithEmbeddings = await Promise.all(books.map(async (doc) => {
            const textWithMetadata = `Title: ${doc.title}. Genre: ${doc.genre}. Content: ${doc.content}`;
            const embedding = await extractor(textWithMetadata, { pooling: 'mean', normalize: true });
            doc["embeddings"] = Array.from(embedding?.ort_tensor?.data, x => Number(x));
            return doc;
        }));
        return await this.client.helpers.bulk({
            datasource: documentsWithEmbeddings,
            onDocument(doc) {
                return {
                    index: {
                        _index: 'my_documents'
                    }
                };
            }
        });
    }
    async searchSimilarDocuments(query) {
        const queryEmbedding = await this.getEmbedding(query);
        const result = await this.client.search({
            _source: ["title", "content", "genre"],
            knn: {
                field: 'embeddings',
                query_vector: Array.from(queryEmbedding?.ort_tensor?.data, x => Number(x))
            }
        });
        return result.hits;
    }
}
exports.ElasticService = ElasticService;
//# sourceMappingURL=elastic.service.js.map