# Contributing Guide

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/it-connect-matrimony.git`
3. Follow the [Setup Guide](./setup.md) to get the development environment running
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Branch Naming
```
feature/description     # New features
fix/description         # Bug fixes
refactor/description    # Code refactoring
docs/description        # Documentation changes
chore/description       # Maintenance, dependencies
```

### Commit Messages
Follow conventional commits:
```
feat: Add user activity tracking
fix: Resolve OTP expiry race condition
refactor: Extract notification service
docs: Update API documentation
chore: Update dependencies
test: Add chat service unit tests
```

### Pull Request Process
1. Ensure all tests pass: `npm test`
2. Ensure lint passes: `npm run lint`
3. Ensure types check: `npx tsc --noEmit`
4. Update documentation if needed
5. Create PR with descriptive title and body
6. Request review from at least one team member
7. Squash merge when approved

## Code Style

### TypeScript
- Use strict TypeScript with `strict: true` in tsconfig
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values
- Use `const` for constants, `readonly` for immutable properties
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### NestJS
- Follow modular architecture: each feature in its own module
- Use DTOs for all request/response validation
- Use services for business logic (controllers should be thin)
- Use guards for authentication and authorization
- Use interceptors for cross-cutting concerns (logging, transformation)
- Use exception filters for consistent error handling

### Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | `AuthService`, `CreateUserDto` |
| Variables | camelCase | `userRepository`, `accessToken` |
| Functions | camelCase | `generateTokens()`, `sendOtp()` |
| Files | kebab-case | `auth.service.ts`, `login.dto.ts` |
| Entities | PascalCase | `User`, `Profile`, `Conversation` |
| Modules | PascalCase | `AuthModule`, `ChatModule` |
| Enums | PascalCase | `UserRole`, `Gender` |
| Constants | UPPER_SNAKE | `MAX_RETRY_ATTEMPTS` |
| Database columns | snake_case | `first_name`, `email_verified_at` |
| API routes | kebab-case | `/auth/login`, `/search/saved` |
| Kafka topics | kebab-case | `email-notification`, `photo-moderation` |

### Testing
- **Unit tests**: Jest, target 90%+ coverage on services
- **Integration tests**: Supertest for API endpoints
- **File naming**: `*.spec.ts` alongside source files
- **Test patterns**: Use descriptive `describe`/`it` blocks
```typescript
describe('AuthService', () => {
  describe('register', () => {
    it('should create a new user with valid data', async () => { ... });
    it('should reject duplicate email registration', async () => { ... });
  });
});
```

### Dependencies
- Do not add new dependencies without team discussion
- Prefer built-in NestJS modules over external libraries
- Keep dependencies up to date via Dependabot
- Regular `npm audit` to check for vulnerabilities

## Environment Setup

### Required Tools
- Node.js 20+
- npm 10+
- Docker Desktop
- MySQL 8.0 client
- Redis CLI

### VS Code Extensions
- ESLint
- Prettier
- Jest Runner
- Thunder Client (API testing)
- Docker

## Code Review Guidelines

### What to Check
- Correctness: Does the code do what it claims?
- Security: Are there any security vulnerabilities?
- Performance: Are there N+1 queries, unnecessary operations?
- Maintainability: Is the code readable and well-structured?
- Testability: Are there adequate tests?
- Error handling: Are all error paths covered?
- Logging: Are errors properly logged?

### Review Process
1. Read the PR description to understand context
2. Review changes file by file
3. Leave constructive comments
4. Approve if everything looks good
5. Squash merge when approved

## Project Structure

```
it-connect-matrimony/
├── backend/                    # NestJS backend
│   └── src/
│       ├── common/             # Shared utilities, DTOs, enums
│       ├── config/             # Configuration modules
│       ├── database/           # Entities, migrations, subscribers
│       ├── events/             # Event definitions
│       ├── integrations/       # External service integrations
│       ├── modules/            # Feature modules
│       └── websocket/          # WebSocket adapters
├── web/                        # Next.js frontend
├── admin/                      # Next.js admin panel
├── mobile/                     # React Native app
├── database/                   # SQL schemas
├── infrastructure/             # Docker, K8s, Terraform
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
└── docs/                       # Documentation
```
