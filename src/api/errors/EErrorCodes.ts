/**
 * Enumeration of all error codes used in the application
 */
export enum EErrorCodes {
  // General errors (1000-1099)
  GENERAL_ERROR = 1000,
  BAD_REQUEST = 1001,
  UNAUTHORIZED = 1002,
  NOT_FOUND = 1003,
  CONFLICT = 1004,
  VALIDATION_ERROR = 1005,
  NOT_IMPLEMENTED = 1006,
  
  // Authentication errors (1100-1199)
  INVALID_CREDENTIALS = 1100,
  EXPIRED_TOKEN = 1101,
  INVALID_TOKEN = 1102,
  
  // User errors (1200-1299)
  USER_NOT_FOUND = 1200,
  USER_ALREADY_EXISTS = 1201,
  USER_INVALID_STATUS = 1202,
  USER_CREATION_FAILED = 1203,
  USER_UPDATE_FAILED = 1204,
  USER_DELETE_FAILED = 1205,
  USER_ACTIVATION_FAILED = 1206,
  USER_DEACTIVATION_FAILED = 1207,
  USER_INVITE_FAILED = 1208,
  USER_INVITE_RESEND_FAILED = 1209,
  USER_ALREADY_ARCHIVED = 1210,
  USER_ARCHIVE_FAILED = 1211,
  USER_RESTORE_FAILED = 1212,
  ARCHIVED_USER_NOT_FOUND = 1213,
  
  // Post errors (1300-1399)
  POST_NOT_FOUND = 1300,
  POST_CREATION_FAILED = 1301,
  POST_UPDATE_FAILED = 1302,
  POST_DELETE_FAILED = 1303,
  
  // Comment errors (1400-1499)
  COMMENT_NOT_FOUND = 1400,
  COMMENT_CREATION_FAILED = 1401,
  COMMENT_UPDATE_FAILED = 1402,
  COMMENT_DELETE_FAILED = 1403,
  
  // External service errors (1500-1599)
  COGNITO_ERROR = 1500,
  EMAIL_SERVICE_ERROR = 1501,
  DATABASE_ERROR = 1502,
  S3_ERROR = 1503,
  KMS_ERROR = 1504
}

export function getErrorCodesDescription() {
  const codes = Object.values(EErrorCodes).filter(value => typeof value === 'number');
  const names = Object.values(EErrorCodes).filter(value => typeof value !== 'number');
  return codes.map((c, i) => `- ${names[i]} -> ${c}`).join('\n');
}