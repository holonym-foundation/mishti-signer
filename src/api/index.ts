import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import sponsor from './sponsor';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/sponsor', sponsor);

export default router;
