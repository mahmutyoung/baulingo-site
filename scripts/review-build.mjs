import { parentPort } from 'node:worker_threads';
import { build } from './build.mjs';
import { createReviewSeed } from './review-server.mjs';

await build();
parentPort.postMessage(Object.fromEntries(['intro', 'listening', 'reading', 'writing', 'speaking', 'result'].map(stage => [stage, createReviewSeed(stage)])));
