import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { register } from 'src/controllers/auth/register';
import { login } from 'src/controllers/auth/login';
import { RegisterResponseSchema, RegisterRequestSchema } from 'src/api/routes/schemas/auth/RegisterSchema';
import { LoginResponseSchema, LoginRequestSchema } from 'src/api/routes/schemas/auth/LoginSchema';

const registerRoute = {
  schema: {
    response: {
      200: RegisterResponseSchema
    },
    body: RegisterRequestSchema
  }
};

const loginRoute = {
  schema: {
    response: {
      200: LoginResponseSchema
    },
    body: LoginRequestSchema
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.post('/register', registerRoute, async (req) => {
    const { email, password, firstName, lastName } = req.body;
    return register({
      userRepo: fastify.repos.userRepo,
      email,
      password,
      firstName,
      lastName
    });
  });

  fastify.post('/login', loginRoute, async (req) => {
    const { email, password } = req.body;
    return login({
      email,
      password
    });
  });
};

export default routes;
