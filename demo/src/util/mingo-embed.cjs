const { runAsWorker } = await import('./sync_worker.cjs')

let extractor;
async function init() {
  if (extractor) return extractor;
  const { env, pipeline } = await import("@xenova/transformers");
  env.cacheDir = "./.cache";
  env.allowRemoteModels = true;
  console.log("Loading embedding model...");
  extractor = await pipeline(
    "feature-extraction",
    "Xenova/multilingual-e5-base",
    { revision: "main" },
  );
  console.log("Embedding model loaded.");
  return extractor;
}

function createQueryEmbedding(query, options = {}) {
  return extractor("query: " + query, {
    pooling: "mean",
    normalize: true,
    ...options,
  }).then((res) => [...res.data]);
}

function createPassageEmbedding(passage, options = {}) {
  return extractor("passage: " + passage, {
    pooling: "mean",
    normalize: true,
    ...options,
  }).then((res) => [...res.data]);
}

runAsWorker(async ({passage, query}) => {
  await init();
  if (query) {
    return createQueryEmbedding(query);
  }
  if (passage) {
    return createPassageEmbedding(passage);
  }
})