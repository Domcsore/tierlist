import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifyPostgres, { PostgresPluginOptions } from "fastify-postgres";

const postgresOptions: PostgresPluginOptions = {
  connectionString: 'postgres://postgres:Hannah@localhost/postgres',
}

const postgresConnector: FastifyPluginAsync = async (fastify, options) => {
  fastify.register(fastifyPostgres, postgresOptions);
} 

export default fastifyPlugin(postgresConnector);