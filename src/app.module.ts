import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { appConfig, databaseConfig, jwtConfig, storageConfig, emailConfig, validate } from './config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma';
import { EmailModule } from './modules/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DrainagePointModule } from './modules/drainage-point/drainage-point.module';
import { DrainageSegmentModule } from './modules/drainage-segment/drainage-segment.module';
import { FloodZoneModule } from './modules/flood-zone/flood-zone.module';
import { UploadModule } from './modules/upload/upload.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      load: [appConfig, databaseConfig, jwtConfig, storageConfig, emailConfig],
      validate,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('app.nodeEnv');
        const isDev = nodeEnv === 'development';

        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            transport: isDev
              ? { target: 'pino-pretty', options: { colorize: true } }
              : undefined,
          },
        };
      },
    }),
    PrismaModule,
    EmailModule,
    AuthModule,
    UserModule,
    DrainagePointModule,
    DrainageSegmentModule,
    FloodZoneModule,
    UploadModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
