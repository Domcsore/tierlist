import { FastifyPluginAsync } from "fastify";

export interface ICategoryItem {
  id: string;
  name: string;
  categoryId: string;
}

export const schema = {
  $id: 'categoryItem',
  type: 'object',
  properties: {
    id: {type: 'string'},
    name: {type: 'string'},
    categoryId: {type: 'string'}
  }
}

export const routes: FastifyPluginAsync = async (fastify, options) => {
  
}