import { FastifyPluginAsync } from "fastify";
import { IRouteResponse } from "./routes";

export interface ITierlistItem {
  id: string;
  name: string;
  tierlistId: string;
}

export const schema = {
  $id: 'tierlistItem',
  type: 'object',
  properties: {
    id: {type: 'string'},
    name: {type: 'string'},
    tierlistId: {type: 'string'}
  }
}

export const routes: FastifyPluginAsync = async (fastify, options) => {
  
}