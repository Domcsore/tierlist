import { FastifyPluginAsync } from "fastify";

export interface ICategoryItem {
  id: string;
  name: string;
  tierlistId: string;
}

export const schema = {
  $id: 'categoryItem',
  type: 'object',
  properties: {
    id: {type: 'string'},
    name: {type: 'string'},
    tierlistId: {type: 'string'}
  }
}

export const routes: FastifyPluginAsync = async (fastify, options) => {
  
}