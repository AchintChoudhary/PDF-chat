/**
 * OpenRouter FREE embedding service
 *
 * Model:
 * liquid/lfm-2.5-embedding-350m:free
 *
 * Output:
 * 1024-dimensional embedding vector
 */

const OPENROUTER_EMBEDDING_MODEL =
  'liquid/lfm-2.5-embedding-350m:free';

const VECTOR_DIMENSION = 1024;

const getApiKey = () => {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key || key === 'your_openrouter_api_key_here') {
    throw new Error(
      'OPENROUTER_API_KEY is missing. Add your OpenRouter API key to backend/.env'
    );
  }

  return key;
};

/**
 * Generate one embedding using OpenRouter.
 */
export const generateEmbedding = async (text) => {
  if (!text || !text.trim()) {
    throw new Error('Cannot generate embedding for empty text.');
  }

  const apiKey = getApiKey();

  const response = await fetch(
    'https://openrouter.ai/api/v1/embeddings',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',

        // Optional OpenRouter metadata
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'DocuMind PDF Chat',
      },
      body: JSON.stringify({
        model: OPENROUTER_EMBEDDING_MODEL,
        input: text,
        encoding_format: 'float',
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenRouter embedding error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const embedding = data?.data?.[0]?.embedding;

  if (!Array.isArray(embedding)) {
    throw new Error(
      'OpenRouter returned an invalid embedding response.'
    );
  }

  if (embedding.length !== VECTOR_DIMENSION) {
    throw new Error(
      `Unexpected embedding dimension. Expected ${VECTOR_DIMENSION}, received ${embedding.length}.`
    );
  }

  return embedding;
};

/**
 * Generate embeddings for all document chunks.
 *
 * Requests are intentionally sequential to reduce the chance
 * of hitting free-tier rate limits.
 */
export const generateBatchEmbeddings = async (chunks) => {
  if (!Array.isArray(chunks)) {
    throw new Error('chunks must be an array.');
  }

  const embeddings = [];

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text);
    embeddings.push(embedding);

    // Small delay to be friendly to free endpoint rate limits.
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return embeddings;
};

export { VECTOR_DIMENSION };