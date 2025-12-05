# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**千川SDK管理平台** - A full-stack advertising management system built on top of Douyin's Qianchuan Ad SDK (巨量引擎千川广告SDK). The platform enables OAuth2.0 authentication, campaign/ad/creative management, reporting, and media uploads.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript 5 + Vite 5 + Zustand + React Router v6 + Tailwind CSS 3
- **Backend:** Go 1.21 + Gin + Session-based Auth
- **SDK:** oceanengineSDK (`github.com/bububa/oceanengine`) - Third-party Go SDK for Qianchuan OpenAPI

**Project Completion:** ~85% (SDK migration complete, most API endpoints implemented)

## Commands

### Development

```bash
# Start both frontend and backend in parallel
make dev

# Start backend only (port 8080)
make backend
cd backend && go run cmd/server/main.go

# Start frontend only (port 3000)
make frontend
cd frontend && npm run dev
```

### Installation

```bash
# Install all dependencies (frontend + backend)
make install

# Backend dependencies
make install-backend
cd backend && go mod tidy && go mod download

# Frontend dependencies
make install-frontend
cd frontend && npm install
```

### Build

```bash
# Build both frontend and backend
make build

# Backend build (outputs to backend/bin/server)
make build-backend
cd backend && go build -o bin/server ./cmd/server

# Frontend build (outputs to frontend/dist/)
make build-frontend
cd frontend && npm run build
```

### Code Quality

```bash
# Frontend linting and type checking
cd frontend
npm run lint              # ESLint
npm run type-check        # TypeScript type checking

# Backend linting
cd backend
go fmt ./...              # Format code
go vet ./...              # Static analysis
```

### Testing

```bash
# Run all tests
make test

# Backend tests
make test-backend
cd backend && go test -v ./...

# Frontend tests
cd frontend
npm run test              # Run tests with Vitest
npm run test:ui           # Test UI
npm run test:coverage     # Coverage report

# Run a single test file (backend)
cd backend && go test -v ./internal/handler/advertiser_test.go

# Run a single test file (frontend)
cd frontend && npm run test -- auth.test.ts
```

### Docker

```bash
# Build and start services
make docker-up
docker-compose up -d

# Build Docker images
make docker-build
docker-compose build

# Stop services
make docker-down
docker-compose down

# View logs
docker-compose logs -f
```

### Other

```bash
# Format all code
make fmt

# Clean build artifacts
make clean

# Show version info
make version
```

## Architecture

### High-Level Architecture

This is a **3-tier architecture** with frontend-backend separation:

```
┌─────────────────────────────────────────────────────────┐
│  React SPA (Static Site)                                 │
│  - Zustand for state management                          │
│  - Axios for HTTP calls                                  │
│  - Session-based auth via HttpOnly cookies              │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS (Cookie Session)
┌──────────────────┴──────────────────────────────────────┐
│  Go Backend (Gin HTTP Server)                            │
│  - Session validation & token management                 │
│  - API proxy to Qianchuan SDK                            │
│  - Data transformation & sanitization                    │
└──────────────────┬──────────────────────────────────────┘
                   │ qianchuanSDK calls
┌──────────────────┴──────────────────────────────────────┐
│  qianchuanSDK (Go SDK)                                   │
│  - OAuth2.0 flow                                         │
│  - Rate limiting                                         │
│  - Token refresh                                         │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP REST API
┌──────────────────┴──────────────────────────────────────┐
│  Qianchuan OpenAPI (巨量引擎千川API)                       │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture

**Layer Structure:**
```
backend/
├── cmd/server/           # Application entry point
│   └── main.go           # Gin router setup, middleware config, DI
├── internal/             # Private application code
│   ├── handler/          # HTTP handlers (thin layer, delegates to service)
│   ├── middleware/       # Middleware (auth, CORS, logging, tracing)
│   ├── service/          # Business logic (wraps qianchuanSDK)
│   └── util/             # Utilities (response helpers)
└── pkg/                  # Public packages
    └── session/          # Session management
```

**Key Backend Patterns:**
1. **Dependency Injection:** `main.go` creates services and handlers, passes dependencies explicitly
2. **Session-Based Auth:** Uses `gin-contrib/sessions` with cookie store; tokens stored server-side
3. **Middleware Chain:** `Logger() → CORS() → Trace() → Sessions() → AuthRequired()`
4. **SDK Wrapping:** Service layer wraps `qianchuanSDK.Manager`, handles token exchange
5. **Error Handling:** Standardized JSON responses via `util.ErrorResponse()` and `util.SuccessResponse()`

**Critical Backend Files:**
- `cmd/server/main.go` - Router setup, all route definitions
- `internal/service/qianchuan.go` - Core business logic, SDK interaction
- `internal/middleware/auth.go` - Session validation middleware
- `pkg/session/session.go` - Session utilities

### Frontend Architecture

**Layer Structure:**
```
frontend/src/
├── api/                  # API service layer (Axios instances)
│   ├── client.ts         # Configured Axios instance with interceptors
│   ├── auth.ts           # Auth API calls
│   ├── advertiser.ts     # Advertiser API calls
│   └── [module].ts       # Other domain APIs
├── store/                # Zustand stores (state management)
│   ├── auth.ts           # Auth state (user info, login status)
│   └── [module].ts       # Domain-specific state
├── pages/                # Page components (one per route)
├── components/           # Reusable UI components
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── ui/               # Base UI components (Button, Input, etc.)
│   └── common/           # Business components
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
└── App.tsx               # Root component with routing
```

**Key Frontend Patterns:**
1. **Layered API Calls:** `Page → API Service → Axios Client`
2. **State Management:** Zustand stores for global state (auth, user), local state for component state
3. **Route Protection:** `<PrivateRoute>` wrapper checks auth state before rendering
4. **Error Boundaries:** Centralized error handling via Axios interceptors
5. **Code Splitting:** React.lazy() for page-level code splitting, configured in `vite.config.ts`

**Critical Frontend Files:**
- `src/api/client.ts` - Axios configuration, request/response interceptors
- `src/store/auth.ts` - Auth state management
- `src/App.tsx` - Route definitions, protected routes
- `vite.config.ts` - Build optimization, code splitting rules

### oceanengineSDK Architecture

The SDK uses the third-party `github.com/bububa/oceanengine` SDK which provides:
- **Type-Safe API:** All API methods have typed request/response structs
- **OAuth2.0 Flow:** Authorization code exchange, refresh token handling
- **Complete API Coverage:** Supports Qianchuan, Ad Platform, and other Ocean Engine APIs

**SDK Wrapper:** `backend/internal/sdk/sdk_client.go` wraps oceanengineSDK with project-specific types

**Key SDK Packages Used:**
- `marketing-api/api/qianchuan/` - Qianchuan API implementations
- `marketing-api/model/qianchuan/` - Request/Response models
- `marketing-api/core` - SDK client core
- `marketing-api/api/oauth` - OAuth2.0 flow

### OAuth2.0 Flow

```
1. User clicks login → Frontend redirects to Qianchuan OAuth page
2. Qianchuan redirects to /auth/callback?code=xxx&state=yyy
3. Frontend sends code to backend: POST /api/oauth/exchange {code}
4. Backend uses qianchuanSDK to exchange code for access_token + refresh_token
5. Backend stores tokens in session, returns Set-Cookie header
6. Frontend stores session cookie (HttpOnly), redirects to dashboard
7. All subsequent API calls include session cookie → Backend validates session → SDK uses stored tokens
```

**Security:** Frontend never sees access tokens; backend proxies all SDK calls.

### Data Flow Pattern

**Standard CRUD Flow:**
```
User Action (Page)
  → API Service Call (src/api/*.ts)
    → Axios Request (src/api/client.ts)
      → Backend Handler (internal/handler/*.go)
        → Service Layer (internal/service/*.go)
          → qianchuanSDK (qianchuanSDK/*.go)
            → Qianchuan OpenAPI
```

## Development Guidelines

### TypeScript Standards

**From .cursor/rules:**
- **NO `any` types** - Use `unknown` or specific types
- **NO `@ts-ignore`** - Use `@ts-expect-error` with explanation
- **Always export public types** - Place in `.types.ts` files
- **Use `interface` for objects**, `type` for unions/functions
- Enable strict mode in `tsconfig.json`

**Example:**
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // implementation
}

// ❌ Bad
function getUser(id: any): any {
  // implementation
}
```

### Go Standards

- **Standard Go conventions:** Use `go fmt`, `go vet`
- **Package structure:** `internal/` for private, `pkg/` for reusable
- **Error handling:** Always return errors, use descriptive messages
- **Naming:** Exported names are PascalCase, unexported are camelCase
- **Testing:** Use table-driven tests, place `*_test.go` alongside source

### Code Quality Rules

**From .cursor/rules:**
- **Max function length:** 100 lines
- **Max file length:** 500 lines (excluding comments/blanks)
- **Max function parameters:** 4 (use struct for more)
- **Max nesting depth:** 3 levels
- **Cyclomatic complexity:** ≤ 10

**Always:**
- Use meaningful variable names (no `data`, `list`, `flag`)
- Validate inputs at function boundaries
- Handle all errors explicitly
- Use constants instead of magic numbers
- Add JSDoc/GoDoc comments for public APIs

### React Component Patterns

**From .cursor/rules:**
- Functional components with hooks (no class components)
- Props interface defined at top of file
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children
- Extract complex logic into custom hooks

**Example:**
```typescript
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(user);
  }, [user, onEdit]);
  
  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
};
```

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `kebab-case.ts` (e.g., `use-user-list.ts`)
- Utils: `kebab-case.ts` (e.g., `format-date.ts`)
- Types: `kebab-case.types.ts` (e.g., `user.types.ts`)

**Constants:**
```typescript
// ✅ Good
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
const maxRetryCount = 3;
const apiBaseUrl = 'https://api.example.com';
```

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `style:` Code formatting (no logic change)
- `refactor:` Code refactoring
- `test:` Add/update tests
- `chore:` Build/tooling changes

**Example:** `feat: add campaign budget update API`

### Environment Variables

**Backend** (.env in `backend/`):
```bash
APP_ID=your_qianchuan_app_id
APP_SECRET=your_qianchuan_app_secret
COOKIE_SECRET=random_32_byte_secret
PORT=8080
GIN_MODE=release
CORS_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
SESSION_NAME=qianchuan_session
```

**Frontend** (.env in `frontend/`):
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_OAUTH_APP_ID=your_app_id
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_APP_TITLE=千川SDK管理平台
VITE_APP_VERSION=1.0.0
```

## Common Tasks

### Adding a New API Endpoint

1. **Backend:** Define route in `cmd/server/main.go`:
   ```go
   apiAuth.GET("/qianchuan/foo/list", fooHandler.List)
   ```

2. **Backend:** Create handler in `internal/handler/foo.go`:
   ```go
   func (h *FooHandler) List(c *gin.Context) {
       // Get session, call service, return response
   }
   ```

3. **Backend:** Add service method in `internal/service/qianchuan.go` if needed

4. **Frontend:** Add API call in `src/api/foo.ts`:
   ```typescript
   export const getFooList = (params: FooListParams) => 
     client.get<ApiResponse<FooList>>('/qianchuan/foo/list', { params });
   ```

5. **Frontend:** Use in page component with error handling

### Adding a New Page

1. Create page in `src/pages/FooPage.tsx`
2. Add route in `src/App.tsx`:
   ```typescript
   <Route path="/foo" element={<FooPage />} />
   ```
3. Add navigation link in `src/components/layout/Sidebar.tsx`

### Debugging Session Issues

- **Check cookie:** DevTools → Application → Cookies → `qianchuan_session`
- **Backend logs:** Session middleware logs authentication attempts
- **Token expiry:** SDK auto-refreshes, but check `token_manager.go` logs
- **CORS issues:** Verify `CORS_ORIGIN` in backend `.env` matches frontend URL

### Working with oceanengineSDK

When implementing new API endpoints:
1. Check available APIs in `oceanengineSDK/marketing-api/api/qianchuan/`
2. Add necessary import to `backend/internal/sdk/sdk_client.go`
3. Implement method in `sdk_client.go` following existing patterns
4. Run `go mod tidy` in `backend/`
5. Test changes in backend handlers

**SDK is fetched from remote** (`github.com/bububa/oceanengine`).

## Important Notes

### Security

- **Never commit secrets** to git (use `.env.example` as template)
- **Frontend never sees tokens** - Backend proxies all SDK calls
- **Session cookies are HttpOnly** - Protected from XSS
- **CSRF protection** - Implemented via SameSite cookies
- OAuth `state` parameter validated to prevent CSRF

### Known Limitations

- **Mock Data:** Some endpoints (file upload, advanced targeting) return mock data - check handler implementations
- **Test Coverage:** Only SDK has comprehensive tests (~95%); backend ~30%, frontend needs E2E tests
- **No Database:** All state is session-based; server restart clears sessions
- **Single Tenant:** No multi-user account management, single advertiser per session

#### Unimplemented Endpoints (501 Not Implemented)

The following API endpoints return HTTP 501 due to SDK limitations or pending implementation:

**Tools API (`internal/sdk/sdk_client.go`):**
- `ToolsIndustryGet` - Get industry categories
- `ToolsInterestActionInterestCategory` - Get interest categories
- `ToolsInterestActionInterestKeyword` - Get interest keywords
- `ToolsInterestActionActionCategory` - Get action categories
- `ToolsInterestActionActionKeyword` - Get action keywords
- `ToolsAwemeMultiLevelCategoryGet` - Get aweme multi-level categories
- `ToolsAwemeAuthorInfoGet` - Get aweme author info
- `ToolsCreativeWordSelect` - Get creative word recommendations
- `DmpAudiencesGet` - Get DMP audiences
  - Note: oceanengineSDK does not provide these Tools APIs

**Finance API (`internal/sdk/sdk_client.go`):**
- `FundTransferSeqCreate` - Create fund transfer sequence
- `FundTransferSeqCommit` - Commit fund transfer
- `RefundTransferSeqCreate` - Create refund transfer sequence
- `RefundTransferSeqCommit` - Commit refund transfer
  - Note: Pending SDK support for fund transfer operations

**Agent API (`internal/sdk/sdk_client.go`):**
- `AgentAdvertiserList` - Get agent advertiser list
  - Note: oceanengineSDK does not provide Agent API

**Note:** All unimplemented endpoints return a response with:
```json
{
  "code": 501,
  "message": "<Feature> 暂未实现"
}
```

### Performance Optimizations

- **Frontend:** Code splitting per route (see `vite.config.ts`), lazy loading
- **Backend:** SDK rate limiting prevents API throttling
- **Frontend:** Zustand for efficient state updates (no unnecessary re-renders)

### Related Documentation

- Full docs in `docs/` folder:
  - `ARCHITECTURE_STATIC_SITE.md` - Detailed architecture
  - `OAUTH_FLOW_AND_AUTH.md` - OAuth implementation details
  - `API_CONTRACTS.md` - API specifications
  - `PROJECT_DEEP_ANALYSIS_COMPREHENSIVE.md` - Deep dive analysis
- SDK docs: https://github.com/bububa/oceanengine
- Frontend docs: `frontend/README.md`

## Cursor AI Rules

This project has comprehensive Cursor AI rules in `.cursor/rules/`:

- **Always Apply:** AI协作规则, TypeScript规范, 代码质量规范
- **File Matching:** React组件规范 (for `.tsx`/`.jsx`), API服务规范 (for `.service.ts`)
- **Workflow:** CRUD开发流程 (auto-matched for CRUD scenarios)

When AI generates code, it will automatically follow these rules to maintain consistency.
