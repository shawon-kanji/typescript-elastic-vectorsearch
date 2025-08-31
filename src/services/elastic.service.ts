import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
import { config } from '../config';
import { embeddingModelNameList, getEmbedder } from '../config/embedding_model';

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

    private async getEmbedding(input: string,modelName: embeddingModelNameList) {
        const extractor = await getEmbedder(modelName);
        return await extractor(input);
    }

    async ingestData(embeddingModelName: embeddingModelNameList) {
        const extractor = await getEmbedder(embeddingModelName);

        const documentsWithEmbeddings = await Promise.all(books.map(async (doc) => {
            const textWithMetadata = `Title: ${doc.title}. Genre: ${doc.genre}. Content: ${doc.content}`;
            const embedding = await extractor(textWithMetadata);
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

    async vectorSearch(query: string,modelName: embeddingModelNameList) {
        const queryEmbedding = await this.getEmbedding(query,modelName);

        const result = await this.client.search({
            index: "my_documents",
            _source: ["title", "content", "genre"],
            knn: {
                field: 'embeddings',
                query_vector: Array.from(queryEmbedding?.ort_tensor?.data as Float32Array, x => Number(x))
            }
        });

        return result.hits;
    }
}
