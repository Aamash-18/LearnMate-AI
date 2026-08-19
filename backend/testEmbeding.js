import dotenv from "dotenv";

dotenv.config();

const { generateEmbedding } = await import("./utils/embeddingUtils.js");

const test = async () => {
    try {
        const embedding = await generateEmbedding(
            "Machine learning is a subset of artificial intelligence."
        );

        console.log("Embedding generated successfully!");
        console.log("Dimensions:", embedding.length);
        console.log("First 10 values:", embedding.slice(0, 10));
    } catch (error) {
        console.error("Embedding generation failed:");
        console.error(error);
    }
};

test();