import { createClient } from '@redis/client';

// ----------------- Client connect/disconnect -----------------

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not set');
}

const redisClient = createClient({ url: process.env.REDIS_URL });

async function getConnectedClient() {
  if (!redisClient.isOpen) {
    redisClient
      .on('error', err => console.log('Redis Client Error', err))
      .connect();
  }

  return redisClient;
}

export async function disconnect() {
  await redisClient.disconnect();
}

// ----------------- Helper methods -----------------

async function get(key: string) {
  const client = await getConnectedClient();
  return client.get(key);
}

async function set(key: string, value: string) {
  const client = await getConnectedClient();
  return client.set(key, value);
}

async function incr(key: string) {
  const client = await getConnectedClient();
  return client.incr(key);
}

// -------------------- Mishti epoch --------------------

const MISHTI_EPOCH = 'mishti_epoch';

export async function getMishtiEpoch(): Promise<number | null> {
  const epoch = await get(MISHTI_EPOCH);
  return epoch ? parseInt(epoch) : null;
}

export async function setMishtiEpoch(value: number) {
  await set(MISHTI_EPOCH, value.toString());
}

// ----------------- Num requests from signer -----------------

const REQUESTS_FROM_SIGNER = 'requests_from_signer';

export async function getRequestsFromSigner(): Promise<number | null> {
  const epoch = await get(REQUESTS_FROM_SIGNER);
  return epoch ? parseInt(epoch) : null;
}

export async function setRequestsFromSigner(value: number) {
  const client = await getConnectedClient();
  await client.set(REQUESTS_FROM_SIGNER, value.toString());
}

export async function incrementRequestsFromSigner() {
  await incr(REQUESTS_FROM_SIGNER);
}

// -------------------- Requests per IP address --------------------

const NUM_REQUESTS = 'num_requests';

const getNumReqIpKey = (ip: string) => `${NUM_REQUESTS}:${ip}`;

export async function getNumRequestsFromIp(ip: string) {
  const numRequests = await get(getNumReqIpKey(ip));
  return numRequests ? parseInt(numRequests) : 0;
}

export async function incrementNumRequestsFromIp(ip: string) {
  const client = await getConnectedClient();
  const key = getNumReqIpKey(ip);
  const result = await client.incr(key);
  if (result === 1) {
    await client.expire(key, 60 * 60); // 1 hour
  }
}
