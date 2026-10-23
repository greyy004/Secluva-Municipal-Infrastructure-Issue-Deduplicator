import express from 'express';
import { CosineSimilarityController } from '../controllers/DedupController.js';

const router = express.Router();

router.post('/vectors', CosineSimilarityController);

export default router;
