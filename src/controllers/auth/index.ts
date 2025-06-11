import { 
  cognitoService, 
  SignUpParams, 
  ConfirmSignUpParams, 
  SignInParams,
  ForgotPasswordParams,
  ConfirmForgotPasswordParams
} from '../../services/aws/cognito';

export class AuthController {
  /**
   * Register a new user
   */
  async register(params: SignUpParams) {
    try {
      const result = await cognitoService.signUp(params);
      return result;
    } catch (error) {
      console.error('Error in register controller:', error);
      throw error;
    }
  }

  /**
   * Confirm user registration with verification code
   */
  async confirmRegistration(params: ConfirmSignUpParams) {
    try {
      const result = await cognitoService.confirmSignUp(params);
      return result;
    } catch (error) {
      console.error('Error in confirm registration controller:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(params: SignInParams) {
    try {
      const result = await cognitoService.signIn(params);
      return result;
    } catch (error) {
      console.error('Error in login controller:', error);
      throw error;
    }
  }

  /**
   * Initiate forgot password process
   */
  async forgotPassword(params: ForgotPasswordParams) {
    try {
      const result = await cognitoService.forgotPassword(params);
      return result;
    } catch (error) {
      console.error('Error in forgot password controller:', error);
      throw error;
    }
  }

  /**
   * Reset password with confirmation code
   */
  async resetPassword(params: ConfirmForgotPasswordParams) {
    try {
      const result = await cognitoService.confirmForgotPassword(params);
      return result;
    } catch (error) {
      console.error('Error in reset password controller:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const authController = new AuthController();
