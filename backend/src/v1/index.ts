import { FastifyPluginAsync } from "fastify";
import fastifyCors from "@fastify/cors";
import postgresConnector from "./plugins/postgresConnector";

import {
  routes as categoryRoutes, 
  schema as categorySchema
} from "./routes/category";

import {
  schema as categoryItemSchema
} from './routes/categoryItem';

const build: FastifyPluginAsync = async (fastify, options) => {
  fastify.register(fastifyCors, {})

  fastify.register(postgresConnector);

  fastify.addSchema(categoryItemSchema);
  fastify.addSchema(categorySchema);

  fastify.register(categoryRoutes);
}

export default build;