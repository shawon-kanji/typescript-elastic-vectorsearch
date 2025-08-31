import { pipeline} from '@huggingface/transformers';
import { Tensor } from '@huggingface/transformers/types/utils/tensor';

export enum embeddingModelNameList {
    "all-MiniLM-L6-v2" = "all-MiniLM-L6-v2",
    "all-mpnet-base-v2" = "all-mpnet-base-v2"
}

const embeddingModels: Record<embeddingModelNameList, (arg: string) => Promise<Tensor>> = {
    "all-MiniLM-L6-v2": async (sentence: string) => {
        const extractor = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2');
        return await extractor(sentence,{
            pooling: 'mean',
            normalize: true,
        });
    },
    "all-mpnet-base-v2": async (sentence: string) => {
        const extractor = await pipeline('feature-extraction', 'sentence-transformers/all-mpnet-base-v2');
        return await extractor(sentence,{
            pooling: 'mean',
            normalize: true,
        });
    }
};


export const getEmbedder = (embeddingModelName: embeddingModelNameList) => {
    return async (sentence: string)=> {
        return await embeddingModels[embeddingModelName](sentence)
    }
}