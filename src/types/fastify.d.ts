import { IRepos } from 'src/repos';
import { IUUIDService } from 'src/services/uuid';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IIdentityService } from 'src/types/IIdentityService';
import { IMailService } from 'src/types/IMailService';
import { ITransactionManager } from 'src/types/ITransaction';
import { IdentityUser } from 'src/types/IdentityUser';
import { IStorageService } from './IStorageService';

// set context type
declare module 'fastify' {
  interface FastifyInstance {
    uuid: IUUIDService;
    db: NodePgDatabase;
    repos: IRepos;
    transactionManager: ITransactionManager;
    identityService: IIdentityService,
    mailService: IMailService,
    storageService: IStorageService
  }

  interface FastifyRequest {
    identityUser?: IdentityUser;
  }
}