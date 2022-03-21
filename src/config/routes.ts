import { Express, NextFunction, Request, Response } from 'express';
import jwt from 'express-jwt';
import guardFactory from 'express-jwt-permissions';
import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { JWT_SECRET } from './environments';

const apiPath = join(__dirname, '../api');
const guard = guardFactory({});

export function mountRoutes(app: Express) {
  for (const collection of readdirSync(apiPath)) {
    const collectionPath = join(apiPath, collection);

    for (const version of readdirSync(collectionPath)) {
      if (/v[0-9]+$/.test(version)) {
        const routes: CommonRoute[] = require(join(collectionPath, version));
        console.log('all routes>>>', routes)
        for (const route of routes) {
          app[route.method](
            join('/api', version, route.path).replace(/\\/g, '/'),
            route.auth ? jwt({ secret: JWT_SECRET }) : [],
            route.permission ? guard.check(route.permission) : [],
            route.upload || [],
            route.validator || [],
            (req: Request, res: Response, next: NextFunction) => {
              route
                .handler(req, res, next)
                .then(() => next)
                .catch(err => next(err));
            },
          );
        }
      }
    }
  }
}
