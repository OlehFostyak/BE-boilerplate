import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { 
  registerSchema, 
  confirmRegistrationSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '../schemas/auth';
import { authController } from '../../../controllers/auth';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // Register a new user
  server.post('/register', {
    schema: registerSchema,
    handler: async (request, reply) => {
      const { email, password, firstName, lastName } = request.body;
      const result = await authController.register({
        email,
        password,
        firstName,
        lastName
      });
      return reply.send(result);
    }
  });

  // Confirm user registration
  server.post('/confirm-registration', {
    schema: confirmRegistrationSchema,
    handler: async (request, reply) => {
      const { email, confirmationCode } = request.body;
      const result = await authController.confirmRegistration({
        email,
        confirmationCode
      });
      return reply.send(result);
    }
  });

  // Login user
  server.post('/login', {
    schema: loginSchema,
    handler: async (request, reply) => {
      const { email, password } = request.body;
      const result = await authController.login({
        email,
        password
      });
      return reply.send(result);
    }
  });

  // Forgot password
  server.post('/forgot-password', {
    schema: forgotPasswordSchema,
    handler: async (request, reply) => {
      const { email } = request.body;
      const result = await authController.forgotPassword({
        email
      });
      return reply.send(result);
    }
  });

  // Reset password
  server.post('/reset-password', {
    schema: resetPasswordSchema,
    handler: async (request, reply) => {
      const { email, confirmationCode, newPassword } = request.body;
      const result = await authController.resetPassword({
        email,
        confirmationCode,
        newPassword
      });
      return reply.send(result);
    }
  });
};

export default authRoutes;
