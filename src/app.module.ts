import { Module, Logger, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ChatsModule } from './modules/chats/chats.module';
import { ChatMembersModule } from './modules/chat-members/chat-members.module';
import { MessagesModule } from './modules/messages/messages.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { EmployeeManagerModule } from './modules/employee-manager/employee-managers.module';
import { LoggerMiddleware } from './middleware/logger.middleware'; 
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AppConfigModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const dbConfig = typeOrmConfig(config);
        const logger = new Logger('Database');
        logger.log('Attempting to connect to the database...');
        try {
          return dbConfig;
        } catch (error) {
          logger.error('Failed to connect to the database:', error.message);
          throw error;
        }
      },
      inject: [ConfigService],
    }),
    UsersModule,
    DepartmentsModule,
    TasksModule,
    ChatsModule,
    ChatMembersModule,
    MessagesModule,
    EmployeeManagerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
