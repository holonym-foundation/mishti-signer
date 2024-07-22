import { privateKeyToAccount } from 'viem/accounts';

require('dotenv').config();

export const MISHTI_RELAY_URL = 'http://159.65.246.91:3031';

export const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY as `0x${string}`;

export const SIGNER_ACCOUNT = privateKeyToAccount(SIGNER_PRIVATE_KEY);

export const MAX_REQUESTS_PER_HOUR = 100;
