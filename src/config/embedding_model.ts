import { pipeline } from '@huggingface/transformers';
import { Tensor } from '@huggingface/transformers/types/utils/tensor';

export enum embeddingModelNameList {
    "all-MiniLM-L6-v2" = "all-MiniLM-L6-v2",
    "all-mpnet-base-v2" = "all-mpnet-base-v2"
}

// Text generation model for enhancing context
export const enhanceText = async (text: string): Promise<string> => {
    const generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
    const prompt = `Enhance the following text with more context and provide a brief summary. Original text: ${text}`;
    const result = await generator(prompt, {
        max_length: 512,
        temperature: 0.7,
        num_return_sequences: 1
    });
    // console.log("== text summery :: ", result)
   if (Array.isArray(result) && result.length > 0 && 'generated_text' in result[0]) {
       return (result[0] as { generated_text: string }).generated_text;
   }
   if (result && typeof result === 'object' && 'generated_text' in result) {
       return (result as { generated_text: string }).generated_text;
   }
   return text;
};

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