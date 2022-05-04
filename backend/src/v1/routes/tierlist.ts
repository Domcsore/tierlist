import fastify, { FastifyPluginAsync, RouteShorthandOptions } from "fastify";
import { DatabaseError } from "pg";
import { v4 as uuid} from 'uuid';
import { IRouteResponse } from "./routes";
import { ICategoryItem } from "./tierlistItem";

export interface ICategory {
  id: string;
  name: string;
  items: ICategoryItem[];
}

interface ICategoryNoItems {
  id: string;
  name: string;
}

export const schema = {
  $id: 'category',
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
            data: { $ref: 'category#'},
            errorMessage: { type: 'string' }
          }
        }
      }
    }
  }

  fastifyInstace.get<{Reply: IRouteResponse<ICategoryNoItems[]>}>('/categories', async (request, reply) => {
    try {
      const result = await fastifyInstace.pg.query('SELECT * FROM categories');
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
          errorMessage: 'No categories found'
        })
      }
    } catch (err) {
      throw err;
    }
  })

  // GET ROUTE

  interface ICategoryGetParams {
    categoryName: string;
  }

  const categoryGetOptions: RouteShorthandOptions = {
    schema: {
      params: {
        type: 'object',
        properties: {
          categoryName: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { $ref: 'category#'},
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

  fastifyInstace.get<{Params: ICategoryGetParams, Reply: IRouteResponse<ICategory>}>('/category/:categoryName', categoryGetOptions, async (request, reply) => {
    try {
      await fastifyInstace.pg.transact(async (client) => {
        const getTierlistResult = await fastifyInstace.pg.query('SELECT * FROM categories WHERE name = $1', [request.params.categoryName]);

      if (getTierlistResult.rows.length > 0) {
        const row = getTierlistResult.rows[0];
        const getTierlistItemsResult = await fastifyInstace.pg.query('SELECT * FROM categoryitems WHERE categoryid = $1', [row.id]);

        const replyData = {
          id: row.id,
          name: row.name,
          items: getTierlistItemsResult.rows as ICategoryItem[]
        }

        reply.status(200);
        reply.send({code: reply.statusCode, data: replyData, errorMessage: null});
      } else {
        reply.status(404);
        reply.send({code: reply.statusCode, data: null, errorMessage: "Could not find the requested category"});
      }
      })
    } catch (err) {
      throw err;
    }
  })

  // POST ROUTE

  interface ICategoryPostParams {
    categoryName: string;
  }

  interface ICategoryPostBody {
    items: string[];
  }

  const categoryPostOpts: RouteShorthandOptions = {
    schema: {
      params: {
        type: 'object',
        properties: {
          categoryName: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          items: {
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
            data: { $ref: 'category#'},
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
    Params: ICategoryPostParams, 
    Reply: IRouteResponse<ICategory>, 
    Body: ICategoryPostBody
  }>('/category/:categoryName', categoryPostOpts, async (request, reply) => {
    const categoryName = request.params.categoryName;

    try {
      await fastifyInstace.pg.transact(async (client) => {
        // Generate ID
        const genCategoryId = uuid();

        // Send database request
        const categoryInsertResult = await client.query('INSERT INTO categories VALUES($1, $2) RETURNING id', [genCategoryId, categoryName]);

        // Insert items and build response array
        let replyItemsData: ICategoryItem[] = [];
        const items = request.body.items;
        for (let i = 0; i < items.length; i++) {
          const genItemId = uuid();
          const itemName = items[i];
          await client.query('INSERT INTO categoryItems VALUES($1, $2, $3)', [genItemId, itemName, genCategoryId]);
          replyItemsData.push({id: genItemId, name: itemName, tierlistId: genCategoryId});
        }

        // Handle database response
        if (categoryInsertResult.rows.length > 0) {
          const row = categoryInsertResult.rows[0]
          reply.status(200);
          reply.send({code: reply.statusCode, data: {id: row.id, name: categoryName, items: replyItemsData}, errorMessage: null});
        } else {
          reply.status(500);
          reply.send({code: reply.statusCode, data: null, errorMessage: 'Could not add category'});
        }
      });
    } catch (err) {
      // Handle if database error or otherwise
      if (err instanceof DatabaseError) {
        reply.status(500);
        let errorMessage: string = '';

        // Use postgres error codes to modify reply
        if (err.code === '23505') {
          errorMessage = `Category with the name "${categoryName}" already exists`;
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

  interface ICategoryDeleteParams {
    categoryName: string;
  }

  const categoryDeleteOptions: RouteShorthandOptions = {
    schema: {
      params: {
        type: 'object',
        properties: {
          categoryName: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { $ref: 'category#'},
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

  fastifyInstace.delete<{Params: ICategoryDeleteParams, Reply: IRouteResponse<ICategoryNoItems>}>('/category/:categoryName', categoryDeleteOptions, async (request, reply) => {
    try {
      await fastifyInstace.pg.transact(async (client) => {
        const categoryName = request.params.categoryName;
        const categoryGetIdResult = await fastifyInstace.pg.query('SELECT id FROM categories WHERE name = $1', [categoryName]);
        await fastifyInstace.pg.query('DELETE from categoryItems WHERE categoryId = $1', [categoryGetIdResult.rows[0].id]);
        const result = await fastifyInstace.pg.query('DELETE FROM categories WHERE name = $1 RETURNING id, name', [categoryName]);
        if (result.rows.length > 0) {
          const row = result.rows[0]
          reply.status(200);
          reply.send({code: reply.statusCode, data: {id: row.id, name: row.name}, errorMessage: null});
        } else {
          reply.status(404);
          reply.send({code: reply.statusCode, data: null, errorMessage: 'Could not find requested category'});
        }
      });
    } catch (err) {
      throw (err);
    }
  })

  interface ICategorySearchParams {
    categoryName: string;
  }

  const tierlistSearchOptions: RouteShorthandOptions = {
    schema: {
      params: {
        type: 'object',
        properties: {
          categoryName: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'number' },
            data: { $ref: 'category#'},
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
        },
        400: {
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

  fastifyInstace.get<{Params: ICategorySearchParams, Reply: IRouteResponse<ICategoryNoItems[]>}>('/categories/search/:categoryName', async(request, reply) => {
    const tierlistName = request.params.categoryName;

    // Only do search if search query contains more that 3 letters
    if (tierlistName.length < 3) {
      reply.status(400);
      reply.send({code: reply.statusCode, data: null, errorMessage: 'Search query must contain 3 or more characters'});
    };

    try {
      const getSearchResult = await fastifyInstace.pg.query('SELECT * FROM categories WHERE position($1 IN name) > 0 LIMIT 10', [tierlistName]);
      if (getSearchResult.rowCount > 0) {
        reply.status(200);
        reply.send({code: reply.statusCode, data: getSearchResult.rows, errorMessage: null});
      } else {
        reply.status(404);
        reply.send({code: reply.statusCode, data: null, errorMessage: 'Could not find requested category'});
      }
    } catch(err) {
      throw(err);
    }
  })
};