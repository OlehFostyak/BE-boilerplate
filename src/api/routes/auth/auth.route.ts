import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { register } from 'src/controllers/auth/register';
import { login } from 'src/controllers/auth/login';
import { acceptInvite } from 'src/controllers/user/accept-invite';
import { RegisterResponseSchema, RegisterRequestSchema } from 'src/api/routes/schemas/auth/RegisterSchema';
import { LoginResponseSchema, LoginRequestSchema } from 'src/api/routes/schemas/auth/LoginSchema';
import {
  AcceptInviteReqSchema,
  AcceptInviteRespSchema,
  ErrorResponseSchema
} from 'src/api/routes/schemas/admin/InviteUserSchema';

const registerRoute = {
  schema: {
    response: {
      200: RegisterResponseSchema
    },
    body: RegisterRequestSchema
  },
  config: {
    skipAuthHook: true // Skip authentication for this route
  }
};

const loginRoute = {
  schema: {
    response: {
      200: LoginResponseSchema
    },
    body: LoginRequestSchema
  },
  config: {
    skipAuthHook: true // Skip authentication for this route
  }
};

const acceptInviteRoute = {
  schema: {
    body: AcceptInviteReqSchema,
    response: {
      200: AcceptInviteRespSchema,
      400: ErrorResponseSchema,
      500: ErrorResponseSchema
    }
  },
  config: {
    skipAuthHook: true // Skip authentication for this route
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

  // Accept invitation and complete registration
  fastify.post('/accept-invite', acceptInviteRoute, async (req) => {
    const { email, firstName, lastName, password, expireAt, signature } = req.body;

    return await acceptInvite({
      userRepo: fastify.repos.userRepo,
      email,
      firstName,
      lastName,
      password,
      expireAt,
      signature
    });
  });
};

export default routes;
