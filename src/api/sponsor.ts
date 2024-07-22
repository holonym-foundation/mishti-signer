import express from 'express';
import { MAX_REQUESTS_PER_HOUR } from '../constants';
import { sendMishtiRequest } from '../utils';
import {
  getNumRequestsFromIp,
  incrementNumRequestsFromIp,
} from '../utils/redis';

const router = express.Router();

type RequestBody = {
  method: string;
  point: number[];
  extra_data?: number[];
};

router.post<RequestBody, string>('/', async (req, res) => {
  const { method, point, extra_data } = req.body;

  if (!['OPRFSecp256k1', 'DecryptBabyJubJub', 'JWTPRFSecp256k1'].includes(method)) {
    return res.status(400).send('Invalid method');
  }

  if (!point) {
    return res.status(400).send('Missing required parameter "point"');
  }
  
  // TODO: Lock a mutex for the duration of this request. We need to 
  // atomically increment the number of requests from the signer and
  // make sure the stated number of requests from the signer is
  // correct for each request.

  // Rate limit by IP
  const numRequests = await getNumRequestsFromIp(req.ip);
  if (numRequests > MAX_REQUESTS_PER_HOUR) {
    return res.status(429).send('Too many requests');
  }
  await incrementNumRequestsFromIp(req.ip);
  
  // TODO: Make sure request is from Silk user. Call an API-key-protected endpoint in mfaserver

  // Send request to Mishti
  const response = await sendMishtiRequest(
    method, 
    new Uint8Array(point),
    extra_data ? new Uint8Array(extra_data) : null,
  );

  // Return
  res.status(response.status).send(await response.text());
});

export default router;
