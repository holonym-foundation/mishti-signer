import express from 'express';
import { sendMishtiRequest } from '../utils';

const router = express.Router();

router.get<{}, string>('/', async (req, res) => {
  const { method, point, extra_data } = req.body;

  // TODO: Validate request
  // - Rate limit by IP. Use redis
  // - Make sure request is from Silk user. Call API-key-protected endpoint in mfaserver
  // - Validate req.body
  
  const response = await sendMishtiRequest(method, point, extra_data);

  res.status(response.status).send(await response.text());

  // res.json(['😀', '😳', '🙄']);
});

export default router;
