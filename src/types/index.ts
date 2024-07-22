export type MishtiMethod = 'OPRFSecp256k1' | 'DecryptBabyJubJub' | 'JWTPRFSecp256k1';

export type StateResponse = {
  epoch: number;
  requests_from_user: number;
  method?: MishtiMethod;
};

export type RequestToNetwork = {
  method: MishtiMethod;
  point: Uint8Array;
  epoch: number;
  request_per_user: number;
  signature?: Uint8Array;
  extra_data?: Uint8Array;
};
