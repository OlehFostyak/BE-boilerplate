/**
 * AWS Cognito Service
 * 
 * Модульний підхід до роботи з AWS Cognito.
 * Кожна функціональність винесена в окремий модуль для кращої читабельності та підтримки.
 */

// Експортуємо типи та інтерфейси
export * from './modules/types';

// Експортуємо клієнт та конфігурацію
export * from './modules/client';

// Експортуємо функції для роботи з токенами
export * from './modules/token';

// Експортуємо функції для аутентифікації
export * from './modules/auth';

// Експортуємо функції для управління користувачами
export * from './modules/user';

// Для зворотної сумісності з існуючим кодом
import { verifyToken } from './modules/token';
import { signIn } from './modules/auth';
import { adminCreateUser, adminSetUserPassword } from './modules/user';
import { AdminCreateUserParams, SignInParams, CognitoUserPayload } from './modules/types';

/**
 * Клас CognitoService для зворотної сумісності
 * 
 * Цей клас використовує функції з модулів і надає той самий інтерфейс,
 * що й попередня версія, щоб існуючий код продовжував працювати.
 */
export class CognitoService {
  /**
   * Перевіряє токен доступу через AWS Cognito API
   */
  async verifyToken(token: string): Promise<CognitoUserPayload> {
    return verifyToken(token);
  }

  /**
   * Вхід користувача в систему
   */
  async signIn(params: SignInParams) {
    return signIn(params);
  }

  /**
   * Створення користувача (адмін API)
   */
  async adminCreateUser(params: AdminCreateUserParams) {
    return adminCreateUser(params);
  }

  /**
   * Встановлення пароля для користувача (адмін API)
   */
  async adminSetUserPassword(params: { email: string; password: string; permanent: boolean }) {
    return adminSetUserPassword(params);
  }
}

// Singleton instance для зворотної сумісності
let cognitoServiceInstance: CognitoService | null = null;

/**
 * Отримати екземпляр CognitoService
 */
export function getCognitoService(): CognitoService {
  if (!cognitoServiceInstance) {
    cognitoServiceInstance = new CognitoService();
  }
  return cognitoServiceInstance;
}

// Експортуємо екземпляр сервісу для зворотної сумісності
export const cognitoService = getCognitoService();
