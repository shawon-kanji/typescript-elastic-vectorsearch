"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticService = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("../config");
const embedding_model_1 = require("../config/embedding_model");
dotenv_1.default.config();
const books = config_1.config.books;
class ElasticService {
    client;
    constructor() {
        this.client = new elasticsearch_1.Client({
            node: process.env.ELASTIC_SEARCH_URL,
            auth: {
                apiKey: process.env.ELASTIC_SEARCH_API_KEY || ''
            }
        });
    }
    async getEmbedding(input, modelName) {
        const extractor = await (0, embedding_model_1.getEmbedder)(modelName);
        return await extractor(input);
    }
    async ingestData(embeddingModelName) {
        const extractor = await (0, embedding_model_1.getEmbedder)(embeddingModelName);
        const documentsWithEmbeddings = await Promise.all(books.map(async (doc) => {
            const textWithMetadata = `Title: ${doc.title}. Genre: ${doc.genre}. Content: ${doc.content}`;
            const embedding = await extractor(textWithMetadata);
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
    async vectorSearch(query, modelName) {
        const queryEmbedding = await this.getEmbedding(query, modelName);
        const result = await this.client.search({
            index: "my_documents",
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