import fastify, { FastifyPluginAsync, RouteShorthandOptions } from "fastify";
import { DatabaseError } from "pg";
import { v4 as uuid} from 'uuid';
import { IRouteResponse } from "./routes";
import { ITierlistItem } from "./tierlistItem";

export interface ITierlist {
  id: string;
  name: string;
  items: ITierlistItem[];
}

interface ITierlistNoItems {
  id: string;
  name: string;
}

export const schema = {
  $id: 'tierlist',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    items: { 
      type: 'array',
      items: { 
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' }
        }
      }
    }
  }
}

export const routes: FastifyPluginAsync = async (fastifyInstace, options) => {
  // GET ALL ROUTE

  const tierlistGetAllOptions: RouteShorthandOptions = {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { $ref: 'tierlist#'},
            errorMessage: { type: 'string' }
          }
        }
      }
    }
  }

  fastifyInstace.get<{Reply: IRouteResponse<ITierlistNoItems[]>}>('/tierlists', async (request, reply) => {
    try {
      const result = await fastifyInstace.pg.query('SELECT * FROM tierlists');
      if (result.rows.length > 0) {
        reply.status(200);
        reply.send({
          code: reply.statusCode,
          data: result.rows,
          errorMessage: null
        })
      } else {
        reply.status(404);
        reply.send({
          code: reply.statusCode,
          data: null,
          errorMessage: 'No tier lists found'
        })
      }
    } catch (err) {
      throw err;
    }
  })

  // GET ROUTE

  interface ITierlistGetParams {
    tiername: string;
  }

  const tierlistGetOptions: RouteShorthandOptions = {
    schema: {
      params: {
        type: 'object',
        properties: {
          tiername: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { $ref: 'tierlist#'},
            errorMessage: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { type: 'null' },
            errorMessage: { type: 'string' }
          }
        }
      }
    }
  }

  fastifyInstace.get<{Params: ITierlistGetParams, Reply: IRouteResponse<ITierlist>}>('/tierlist/:tiername', tierlistGetOptions, async (request, reply) => {
    try {
      await fastifyInstace.pg.transact(async (client) => {
        const getTierlistResult = await fastifyInstace.pg.query('SELECT * FROM tierlists WHERE name = $1', [request.params.tiername]);

      if (getTierlistResult.rows.length > 0) {
        const row = getTierlistResult.rows[0];
        const getTierlistItemsResult = await fastifyInstace.pg.query('SELECT * FROM tierlistItems WHERE tierlistId = $1', [row.id]);

        const replyData = {
          id: row.id,
          name: row.name,
          items: getTierlistItemsResult.rows as ITierlistItem[]
        }

        reply.status(200);
        reply.send({code: reply.statusCode, data: replyData, errorMessage: null});
      } else {
        reply.status(404);
        reply.send({code: reply.statusCode, data: null, errorMessage: "Could not find the requested tier list"});
      }
      })
    } catch (err) {
      throw err;
    }
  })

  // POST ROUTE

  interface ITierlistPostParams {
    tiername: string;
  }

  interface ITierlistPostBody {
    items: string[];
  }

  const tierlistPostOpts: RouteShorthandOptions = {
    schema: {
      params: {
        type: 'object',
        properties: {
          tiername: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          tierItems: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { $ref: 'tierlist#'},
            errorMessage: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { type: 'null'},
            errorMessage: { type: 'string' }
          }
        }
      }
    }
  }

  fastifyInstace.post<{
    Params: ITierlistPostParams, 
    Reply: IRouteResponse<ITierlist>, 
    Body: ITierlistPostBody
  }>('/tierlist/:tiername', tierlistPostOpts, async (request, reply) => {
    const tiername = request.params.tiername;

    try {
      await fastifyInstace.pg.transact(async (client) => {
        // Generate ID
        const genTierlistId = uuid();

        // Send database request
        const tierlistInsertResult = await client.query('INSERT INTO tierlists VALUES($1, $2) RETURNING id', [genTierlistId, tiername]);

        // Insert items and build response array
        let replyItemsData: ITierlistItem[] = [];
        const items = request.body.items;
        for (let i = 0; i < items.length; i++) {
          const genItemId = uuid();
          const itemName = items[i];
          await client.query('INSERT INTO tierlistItems VALUES($1, $2, $3)', [genItemId, itemName, genTierlistId]);
          replyItemsData.push({id: genItemId, name: itemName, tierlistId: genTierlistId});
        }

        // Handle database response
        if (tierlistInsertResult.rows.length > 0) {
          const row = tierlistInsertResult.rows[0]
          reply.status(200);
          reply.send({code: reply.statusCode, data: {id: row.id, name: tiername, items: replyItemsData}, errorMessage: null});
        } else {
          reply.status(500);
          reply.send({code: reply.statusCode, data: null, errorMessage: 'Could not add tier list'});
        }
      });
    } catch (err) {
      // Handle if database error or otherwise
      if (err instanceof DatabaseError) {
        reply.status(500);
        let errorMessage: string = '';

        // Use postgres error codes to modify reply
        if (err.code === '23505') {
          errorMessage = 'Tier list with the name "${tiername}" already exists';
        } else {
          errorMessage = err.message;
        }

        reply.send({code: reply.statusCode, data: null, errorMessage});
      } else {
        throw err;
      }
    }
  })

  // DELETE ROUTE

  interface ITierlistDeleteParams {
    tierlistName: string;
  }

  const tierlistDeleteOptions: RouteShorthandOptions = {
    schema: {
      params: {
        type: 'object',
        properties: {
          tiername: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { $ref: 'tierlist#'},
            errorMessage: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { type: 'null' },
            errorMessage: { type: 'string' }
          }
        }
      }
    }
  }

  fastifyInstace.delete<{Params: ITierlistDeleteParams, Reply: IRouteResponse<ITierlistNoItems>}>('/tierlist/:tierlistName', tierlistDeleteOptions, async (request, reply) => {
    try {
      await fastifyInstace.pg.transact(async (client) => {
        const tierlistName = request.params.tierlistName;
        const tierlistGetIdResult = await fastifyInstace.pg.query('SELECT id FROM tierlists WHERE name = $1', [tierlistName]);
        await fastifyInstace.pg.query('DELETE from tierlistItems WHERE tierlistId = $1', [tierlistGetIdResult.rows[0].id]);
        const result = await fastifyInstace.pg.query('DELETE FROM tierlists WHERE name = $1 RETURNING id, name', [request.params.tierlistName]);
        if (result.rows.length > 0) {
          const row = result.rows[0]
          reply.status(200);
          reply.send({code: reply.statusCode, data: {id: row.id, name: row.name}, errorMessage: null});
        } else {
          reply.status(404);
          reply.send({code: reply.statusCode, data: null, errorMessage: 'Could not find requested tier list'});
        }
      });
    } catch (err) {
      throw (err);
    }
  })
};