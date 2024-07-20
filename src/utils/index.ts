import { get_user_state, sign_request_to_network } from '../mishtiwasm/';
import { MISHTI_RELAY_URL, SIGNER_PRIVATE_KEY, SIGNER_ACCOUNT } from '../constants';

type MishtiMethod = 'OPRFSecp256k1' | 'DecryptBabyJubJub' | 'JWTPRFSecp256k1';

type RequestToNetwork = {
  method: MishtiMethod;
  point: Uint8Array;
  epoch: number;
  request_per_user: number;
  signature?: Uint8Array;
  extra_data?: Uint8Array;
};

type StateResponse = {
  epoch: number;
  method: MishtiMethod;
  requests_from_user: number;
};

/**
 * Return the user state of the sponsor account.
 * 
 * Query cache first. If nothing is found, query Mishti, cache
 * result, and return it.
 */
async function getMishtiSignerState(method: MishtiMethod) {
  // TODO: Get user state
  // - TODO: Check cache for user state
  // - TODO: If not in cache, query mishti
  const state = await get_user_state(method, SIGNER_ACCOUNT.address);
  //   - TODO: Cache result

  // return {
  //   epoch: 0,
  //   method: 'OPRFSecp256k1' as MishtiMethod,
  //   requests_from_user: 0,
  // };

  return JSON.parse(state) as StateResponse;
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

  // TODO: Handle error case where Epoch is too old / incorrect
  // - If epoch is too old, refetch (and re-cache) user state from mishti and retry
}
