"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedder = exports.embeddingModelNameList = void 0;
const transformers_1 = require("@huggingface/transformers");
var embeddingModelNameList;
(function (embeddingModelNameList) {
    embeddingModelNameList["all-MiniLM-L6-v2"] = "all-MiniLM-L6-v2";
    embeddingModelNameList["all-mpnet-base-v2"] = "all-mpnet-base-v2";
})(embeddingModelNameList = exports.embeddingModelNameList || (exports.embeddingModelNameList = {}));
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