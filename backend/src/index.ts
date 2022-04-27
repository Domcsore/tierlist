import Fastify, { FastifyInstance } from 'fastify';
import v1 from './v1/index';

const fastify: FastifyInstance = Fastify({
  logger: true
})

fastify.register(v1, {prefix: 'v1'})

const start = async (): Promise<void> => {
  try {
    await fastify.listen(8080);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();