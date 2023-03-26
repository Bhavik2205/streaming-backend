import express from 'express';
import { createLiveStream, login, signUp, stopLiveStream } from '../controllers/streaming_services/streaming.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/createLiveStream', createLiveStream);
router.post('/stopLiveStream', stopLiveStream);

export default router;