# Swagger API Documentation

The platform uses Swagger/OpenAPI for interactive API documentation.

## Accessing Swagger UI

### Local Development
```
http://localhost:4000/api/v1/docs
```

### Staging
```
https://api.staging.itconnectmatrimony.com/api/v1/docs
```

### Production
```
https://api.itconnectmatrimony.com/api/v1/docs
```

## Configuration

Swagger is set up in `main.ts` using `@nestjs/swagger`:

```typescript
const swaggerConfig = new DocumentBuilder()
  .setTitle('IT Connect Matrimony API')
  .setDescription('REST API for IT Connect Matrimony platform')
  .setVersion('1.0')
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
  .addServer(`http://localhost:${port}`)
  .build();

const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
  customSiteTitle: 'IT Connect Matrimony API Docs',
});
```

## Features

- **Interactive testing**: Try out API endpoints directly from the browser
- **JWT authentication**: Click "Authorize" button and paste your Bearer token
- **Request filtering**: Search/filter endpoints by name
- **Schema exploration**: View request/response models for all endpoints
- **Request duration**: Shows how long each API call took
- **Persist authorization**: Token persists across page reloads

## Decorators

All endpoints are documented using NestJS Swagger decorators:

```typescript
@ApiTags('Authentication')
@ApiOperation({ summary: 'Register a new user' })
@ApiResponse({ status: 201, description: 'User registered successfully' })
@ApiResponse({ status: 409, description: 'Email or phone already exists' })
@ApiBearerAuth('access-token')
```

DTOs use `@nestjs/swagger` decorators for schema generation:

```typescript
export class RegisterDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

## API Groups in Swagger

| Tag | Endpoints |
|-----|-----------|
| Authentication | Auth endpoints |
| Users | User profile management |
| Profiles | Profile section management |
| Search | Profile search and saved searches |
| Interests | Send/accept/reject interests |
| Matches | Match listing and management |
| Recommendations | Daily recommendations |
| Chat | Conversations and messages |
| Payments | Payment orders and verification |
| Subscriptions | Plan management |
| Notifications | In-app notifications and device tokens |
| Uploads | File uploads |
| Admin - Dashboard | Admin analytics |
| Admin - Users | User management |
| Admin - Profiles | Profile management |
| Admin - Payments | Payment management |
| Admin - Reports | Report management |
| Admin - Tickets | Support ticket management |
| Admin - Verifications | Document verification |
| Admin - Settings | Site configuration |
| Admin - Audit Logs | Audit trail |
| Admin - Blogs | Blog content management |
| Analytics | Platform analytics |
| Health | Health check endpoints |
