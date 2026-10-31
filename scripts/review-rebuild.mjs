import { Worker } from 'node:worker_threads';

// A fresh worker has a fresh ES module cache, including topic/page generators.
export function rebuildReviewPreview(workerURL = new URL('./review-build.mjs', import.meta.url)) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerURL, { execArgv: [] });
    let seeds;
    worker.once('message', value => { seeds = value; });
    worker.once('error', reject);
    worker.once('exit', code => {
      if (code !== 0 || !seeds) reject(Error('Local preview rebuild failed.'));
      else resolve(seeds);
    });
  });
}
