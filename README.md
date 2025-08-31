# TypeScript Elasticsearch Vector Search Demo

This project demonstrates how to implement vector search capabilities using Elasticsearch and TypeScript. It uses the Hugging Face Transformers library for text embeddings and provides a REST API for ingesting and searching documents.

## Features

- Text embedding generation using Hugging Face's `all-MiniLM-L6-v2` model
- Vector search implementation with Elasticsearch
- RESTful API endpoints for data ingestion and similarity search
- TypeScript implementation with Express.js
- Environment-based configuration

## Prerequisites

- Node.js (v22 or higher)
- Elasticsearch (running on localhost:9200)
- TypeScript
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone https://github.com/shawon-kanji/typescript-elastic-vectorsearch.git
cd typescript-elastic-vectorsearch
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
PORT=3000
ELASTIC_SEARCH_API_KEY=your_elasticsearch_api_key
ELASTIC_SEARCH_URL=elasticsearch server connection URL
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health`
  - Returns the service health status and timestamp

### Data Ingestion
- `POST /api/ingest`
  - Ingests sample book data into Elasticsearch with vector embeddings
  - No request body required
  - Returns success/error message with ingestion results

### Vector Search
- `GET /api/search?query=your_search_query`
  - Performs similarity search using vector embeddings
  - Required query parameter: `query` (string)
  - Returns similar documents sorted by relevance

## Technical Implementation

The project uses:
- Express.js for the web server
- `@elastic/elasticsearch` for Elasticsearch interactions
- `@huggingface/transformers` for generating text embeddings
- TypeScript for type-safe development

Vector search is implemented by:
1. Converting text to embeddings using the `all-MiniLM-L6-v2` model
2. Storing documents with their embeddings in Elasticsearch
3. Performing similarity search using these embeddings

## Development

For development with auto-recompilation:
```bash
npm run dev
```
