import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../modules/users/users.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // No roles required, allow access
    } 

    const request = context.switchToHttp().getRequest();
    
    const user: User = request.user;

    // If user is not set, allow other guards (e.g., AuthGuard) to handle authentication
    if (!user) {
      return true; // Defer to other guards
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}