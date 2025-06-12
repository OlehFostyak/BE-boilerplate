export enum EErrorCodes {
  GENERAL_ERROR = 1000,
  BAD_REQUEST = 1001,
  UNAUTHORIZED = 1002,
  NOT_FOUND = 1003,
  CONFLICT = 1004,
  VALIDATION_ERROR = 1005
}

export function getErrorCodesDescription() {
  const codes = Object.values(EErrorCodes).filter(value => typeof value === 'number');
  const names = Object.values(EErrorCodes).filter(value => typeof value !== 'number');
  return codes.map((c, i) => `- ${names[i]} -> ${c}`).join('\n');
}