import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { CreatePostReqSchema } from 'src/api/routes/schemas/posts/CreatePostReqSchema';
import { GetPostByIdRespSchema } from 'src/api/routes/schemas/posts/GetPostByIdRespSchema';
import { GetPostsRespSchema } from 'src/api/routes/schemas/posts/GetPostsRespSchema';
import { PaginationQuerySchema } from 'src/api/routes/schemas/PaginationSchema';
import { PostsSortSchema } from 'src/api/routes/schemas/posts/PostsSortSchema';
import { CommentsCountFilterSchema } from 'src/api/routes/schemas/posts/CommentsCountFilterSchema';
import { getPaginatedResponse } from 'src/api/utils/pagination';
import { createPost } from 'src/controllers/post/create-post';
import { getPosts } from 'src/controllers/post/get-posts';

const createPostRoute = {
  schema: {
    response: {
      200: GetPostByIdRespSchema
    },
    body: CreatePostReqSchema
  }
};

const getPostsRoute = {
  schema: {
    response: {
      200: GetPostsRespSchema
    },
    querystring: PaginationQuerySchema.merge(PostsSortSchema).merge(CommentsCountFilterSchema)
  }
};

const routes: FastifyPluginAsync = async function (f) {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  fastify.post('/', createPostRoute, async (req) => createPost({
    postRepo: fastify.repos.postRepo,
    data: { ...req.body, userId: req.userId as string }
  }));

  fastify.get('/', getPostsRoute, async (req) => {
    const {
      limit,
      offset,
      search,
      sortBy,
      sortOrder,
      commentsCountOperator,
      commentsCountValue
    } = req.query;

    const { posts, total } = await getPosts({
      postRepo: fastify.repos.postRepo,
      limit,
      offset,
      search,
      sortBy,
      sortOrder,
      commentsCountOperator,
      commentsCountValue
    });

    return getPaginatedResponse(posts, total, limit, offset);
  });
};

export default routes;