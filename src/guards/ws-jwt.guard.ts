import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    try {
      // Extract token
      const token = client.handshake.headers.authorization?.split(' ')[1];

      // Verify token and get payload
      const payload = this.verifyToken(token);

      // Attach user payload to the request
      context.switchToWs().getData().user = payload;

      return true;
    } catch (error) {
      // Handle different types of authentication errors
      this.handleAuthenticationError(client, error);
      return false;
    }
  }

  verifyToken(token?: string): any {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      return jwt.verify(token, process.env.JWT_SECRET?.toString() || 'secret');
    } catch (error) {
      // Rethrow specific JWT verification errors
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw error;
    }
  }

  private handleAuthenticationError(client: Socket, error: any) {
    // Standardized error response structure
    const errorResponse = this.getErrorResponse(error);

    // Emit error to the specific client
    client.emit('authentication_error', errorResponse);
  }

  private getErrorResponse(error: any) {
    // Standardized error responses for different authentication scenarios
    switch (error.name) {
      case 'TokenExpiredError':
        return {
          success: false,
          type: 'token_expired',
          message: 'Your session has expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        };

      case 'JsonWebTokenError':
        return {
          success: false,
          type: 'invalid_token',
          message: 'Invalid authentication token.',
          code: 'INVALID_TOKEN'
        };

      case 'UnauthorizedException':
        return {
          success: false,
          type: 'unauthorized',
          message: error.message || 'Unauthorized access',
          code: 'UNAUTHORIZED'
        };

      default:
        return {
          success: false,
          type: 'authentication_error',
          message: 'Authentication failed',
          code: 'AUTH_ERROR'
        };
    }
  }
}
