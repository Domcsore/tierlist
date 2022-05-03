import { FastifyPluginAsync } from "fastify";
import fastifyCors from "@fastify/cors";
import postgresConnector from "./plugins/postgresConnector";

import {
  routes as tierlistRoutes, 
  schema as tierlistSchema
} from "./routes/tierlist";

import {
  schema as tierlistItemSchema
} from './routes/tierlistItem';

const build: FastifyPluginAsync = async (fastify, options) => {
  fastify.register(fastifyCors, {})

  fastify.register(postgresConnector);

  fastify.addSchema(tierlistItemSchema);
  fastify.addSchema(tierlistSchema);

  fastify.register(tierlistRoutes);
}

export default build;