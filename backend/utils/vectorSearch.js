import mongoose from 'mongoose';
import { generateEmbedding } from './embeddingUtils.js';

export const findRelevantChunks = async (documentId, query, topK = 3) => {
    if (!documentId) {
        throw new Error('Document ID is required');
    }

    if (!query || !query.trim()) {
        throw new Error('Query is required');
    }

    const queryEmbedding = await generateEmbedding(query);

    const results = await mongoose.connection
        .collection('documentchunks')
        .aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'embedding',
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: topK,
                    filter: {
                        documentId: new mongoose.Types.ObjectId(documentId)
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    documentId: 1,
                    content: 1,
                    pageNumber: 1,
                    chunkIndex: 1,
                    score: {
                        $meta: 'vectorSearchScore'
                    }
                }
            }
        ])
        .toArray();

    return results;
};
