import { get_user_state, sign_request_to_network } from '../mishtiwasm/';
import { MISHTI_RELAY_URL, SIGNER_PRIVATE_KEY, SIGNER_ACCOUNT } from '../constants';
import {
  getMishtiEpoch,
  setMishtiEpoch,
  getRequestsFromSigner,
  setRequestsFromSigner,
  incrementRequestsFromSigner,
} from './redis';
import { MishtiMethod, StateResponse, RequestToNetwork } from '../types';

async function fetchAndCacheSignerState(method: MishtiMethod) {
  const state = await get_user_state(method, SIGNER_ACCOUNT.address);
  const parsed = JSON.parse(state) as StateResponse;
  await setRequestsFromSigner(parsed.requests_from_user);
  await setMishtiEpoch(parsed.epoch);
  return parsed;
}

/**
 * Return the user state of the sponsor account.
 * 
 * Query cache first. If nothing is found, query Mishti, cache
 * result, and return it.
 */
async function getMishtiSignerState(method: MishtiMethod) {
  // Check cache first
  const requests_from_user = await getRequestsFromSigner();
  const epoch = await getMishtiEpoch();
  if (requests_from_user != null && epoch != null) {
    return {
      requests_from_user,
      epoch,
    };
  }

  // If not in cache, query mishti, and cache the result
  const parsed = await fetchAndCacheSignerState(method);

  return parsed;
}

async function signAndPostToMishtiRelayer(
  method: MishtiMethod,
  request: RequestToNetwork,
) {
  const signedRequestBody = JSON.parse(await sign_request_to_network(
    JSON.stringify(request), 
    SIGNER_PRIVATE_KEY,
  ));
  return fetch(`${MISHTI_RELAY_URL}/relay-${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signedRequestBody),
  });
}

/**
 * Send a request to Mishti that requires Mishti credits.
 */
export async function sendMishtiRequest(
  method: MishtiMethod, 
  point: Uint8Array, 
  extra_data: Uint8Array | null = null,
) {
  const state = await getMishtiSignerState(method);

  const request = {
    method,
    point,
    epoch: state.epoch,
    request_per_user: state.requests_from_user + 1,
    extra_data,
  } as RequestToNetwork;

  let resp = await signAndPostToMishtiRelayer(method, request);

  if (!resp.ok) {
    const text = await resp.text();
    // If invalid epoch, refetch and cache signer state to update epoch. 
    // Then try once more.
    if (text == 'Invalid epoch') {
      const newState = await fetchAndCacheSignerState(method);
      request.epoch = newState.epoch;
      resp = await signAndPostToMishtiRelayer(method, request);
    } else {
      // Unknown error. Forward Mishti's response to user
      return {
        status: resp.status,
        text: () => new Promise<string>((resolve) => resolve(text)),
      };
    }
  }

  if (resp.ok) {
    // Update cache
    await incrementRequestsFromSigner();
  }

  return resp;
}
