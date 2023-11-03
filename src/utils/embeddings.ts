'use server'

import { Pipeline } from '@xenova/transformers/types/pipelines';
/* @ts-ignore */
import PipelineSingleton from '../app/api/pipeline'


class Embedder {
  private instance: Pipeline | null;

  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';

  constructor() {
    this.instance = null
  }

  async init(): Promise<Pipeline | null> {
    /* @ts-ignore */
    this.instance = await PipelineSingleton.getInstance();

    // this.extractor = extractor
    return this.instance
  }

  async embed({ text }: { text: string }): Promise<number[]> {
    if (!this.instance) {
      throw new Error("Embedder not initialized");
    }
    const embedding = await this.instance(text);

    if (!embedding || !embedding[0] || !embedding[0].data) {
      throw new Error("Embedding failed");
    }
    return Array.from(embedding[0].data)
  }

}

export { Embedder }
