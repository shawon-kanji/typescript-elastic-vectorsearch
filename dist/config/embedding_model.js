"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedder = exports.enhanceText = exports.embeddingModelNameList = void 0;
const transformers_1 = require("@huggingface/transformers");
var embeddingModelNameList;
(function (embeddingModelNameList) {
    embeddingModelNameList["all-MiniLM-L6-v2"] = "all-MiniLM-L6-v2";
    embeddingModelNameList["all-mpnet-base-v2"] = "all-mpnet-base-v2";
})(embeddingModelNameList = exports.embeddingModelNameList || (exports.embeddingModelNameList = {}));
// Text generation model for enhancing context
const enhanceText = async (text) => {
    const generator = await (0, transformers_1.pipeline)('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
    const prompt = `Enhance the following text with more context and provide a brief summary. Original text: ${text}`;
    const result = await generator(prompt, {
        max_length: 512,
        temperature: 0.7,
        num_return_sequences: 1
    });
    // console.log("== text summery :: ", result)
    if (Array.isArray(result) && result.length > 0 && 'generated_text' in result[0]) {
        return result[0].generated_text;
    }
    if (result && typeof result === 'object' && 'generated_text' in result) {
        return result.generated_text;
    }
    return text;
};
exports.enhanceText = enhanceText;
const embeddingModels = {
    "all-MiniLM-L6-v2": async (sentence) => {
        const extractor = await (0, transformers_1.pipeline)('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2');
        return await extractor(sentence, {
            pooling: 'mean',
            normalize: true,
        });
    },
    "all-mpnet-base-v2": async (sentence) => {
        const extractor = await (0, transformers_1.pipeline)('feature-extraction', 'sentence-transformers/all-mpnet-base-v2');
        return await extractor(sentence, {
            pooling: 'mean',
            normalize: true,
        });
    }
};
const getEmbedder = (embeddingModelName) => {
    return async (sentence) => {
        return await embeddingModels[embeddingModelName](sentence);
    };
};
exports.getEmbedder = getEmbedder;
//# sourceMappingURL=embedding_model.js.map