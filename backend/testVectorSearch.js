import 'dotenv/config';

import mongoose from 'mongoose';
import Document from './models/Document.js';
import { generateEmbedding } from './utils/embeddingUtils.js';

const testVectorSearch = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');

        const document = await Document.findOne({
            status: 'ready'
        });

        if (!document) {
            throw new Error('No ready document found');
        }

        console.log('Testing document:', document.title);
        console.log('Document ID:', document._id.toString());

        const query = 'What is DBMS';

        console.log('Query:', query);

        const queryEmbedding = await generateEmbedding(query);

        console.log(
            'Query embedding dimensions:',
            queryEmbedding.length
        );
        const chunkCount = await mongoose.connection
    .collection('documentchunks')
    .countDocuments({
        documentId: document._id
    });

console.log('Chunks for this document:', chunkCount);
        const documentId = document._id;

        const results = await mongoose.connection
            .collection('documentchunks')
            .aggregate([
             {
                    $vectorSearch: {
                        index: 'vector_index',
                        path: 'embedding',
                        queryVector: queryEmbedding,
                        numCandidates: 100,
                        limit: 3,
                         filter: {
                            documentId: documentId
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

        console.log('\nNumber of results:', results.length);

        console.dir(results, {
            depth: null
        });

    } catch (error) {

        console.error('\nVector search test failed:');
        console.error(error);

    } finally {

        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
};

testVectorSearch();
