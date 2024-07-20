/**
 * Copied from @holonym-foundation/mishtiwasm/pkg/esm/mishtiwasm.d.ts
 */
interface MishtiwasmInterface {
  enable_errors: () => void;
  generate_ephemeral_key_and_sign_conditions_with_it: (conditions_contract: string) => string;
  msg_to_point: (msg: Uint8Array) => string;
  get_user_state: (method: string, address: string) => Promise<string>;
  sign_request_to_network: (request: string, private_key: string) => Promise<string>;
  decrypt: (mishti_user_privkey: string, ciphertext: string, conditions_contract: string, sig: string) => Promise<string>;
  new_mask: () => any;
  make_jwt_request: (secret_mask: string, jwt: string) => Promise<any>;
}

let THE_PACKAGE: MishtiwasmInterface | null = null;

export async function mishtiwasm(): Promise<MishtiwasmInterface> {
  if (THE_PACKAGE) return THE_PACKAGE;
  THE_PACKAGE = await import('@holonym-foundation/mishtiwasm');
  return THE_PACKAGE;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function get_user_state(method: string, address: string) {
  return (await mishtiwasm()).get_user_state(method, address);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function sign_request_to_network(request: string, private_key: string) {
  return (await mishtiwasm()).sign_request_to_network(request, private_key);
}
