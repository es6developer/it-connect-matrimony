import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { jwtConfig, redisConfig, razorpayConfig, awsConfig, elasticsearchConfig, rateLimitConfig } from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SnakeNamingStrategy } from './config/snake-naming.strategy';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ChatModule } from './modules/chat/chat.module';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, razorpayConfig, awsConfig, elasticsearchConfig, rateLimitConfig],
      envFilePath: ['.env'],
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('rateLimit.ttl', 60) * 1000,
          limit: config.get<number>('rateLimit.max', 100),
        },
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password') || '',
        database: config.get<string>('database.database'),
        namingStrategy: new SnakeNamingStrategy(),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
        autoLoadEntities: true,
        retryAttempts: 3,
        retryDelay: 3000,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
      exclude: [`${process.env.API_PREFIX || 'api/v1'}/(.*)`],
    }),

    AuthModule,
    UsersModule,
    ProfilesModule,
    ChatModule,
    MatchmakingModule,
    NotificationsModule,
    PaymentsModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
