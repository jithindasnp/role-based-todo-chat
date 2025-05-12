import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization']; // Extract the Authorization header
    const bearerToken = authHeader?.split(' ')[1]; // Extract the Bearer token

    console.log(`[Request] Method: ${req.method}, URL: ${req.url}, Bearer Token: ${bearerToken || 'None'}`);
    // console.log(`[Request] Headers: ${JSON.stringify(req.headers)}`);
    console.log(`[Request] body:${toString(req.body)}`);
    console.log(`[Request] params:${toString(req.params)}`);
    console.log(`[Request] query:${toString(req.query)}`);
    next();
  }
}

function toString(obj: any) {
  if (typeof obj === 'object') {
    return JSON.stringify(obj);
  }
  return obj;
}
