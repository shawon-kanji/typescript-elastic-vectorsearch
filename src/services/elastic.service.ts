import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
import { pipeline } from '@huggingface/transformers';
import { config } from '../config';

dotenv.config();
const books = config.books;

export class ElasticService {
    private client: Client;

    constructor() {
        this.client = new Client({
            node: process.env.ELASTIC_SEARCH_URL,
            auth: {
                apiKey: process.env.ELASTIC_SEARCH_API_KEY || ''
            }
        });
    }

    private async getEmbedding(input: string) {
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        return await extractor(input, { pooling: 'mean', normalize: true });
    }

    async ingestData() {
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        const documentsWithEmbeddings = await Promise.all(books.map(async (doc) => {
            const textWithMetadata = `Title: ${doc.title}. Genre: ${doc.genre}. Content: ${doc.content}`;
            const embedding = await extractor(textWithMetadata, { pooling: 'mean', normalize: true });
            doc["embeddings"] = Array.from(embedding?.ort_tensor?.data as Float32Array, x => Number(x))
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

    async searchSimilarDocuments(query: string) {
        const queryEmbedding = await this.getEmbedding(query);

        const result = await this.client.search({
            _source: ["title", "content", "genre"],
            knn: {
                field: 'embeddings',
                query_vector: Array.from(queryEmbedding?.ort_tensor?.data as Float32Array, x => Number(x))
            }
        });

        return result.hits;
    }
}
