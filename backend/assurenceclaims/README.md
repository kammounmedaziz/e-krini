# Common Library

## Purpose
Shared utilities, middleware, types, and constants for all microservices.

## Structure
- `middlewares/` - Shared Express middlewares (error handler, validation, auth)
- `utils/` - Utility functions (logging, date formatting, etc.)
- `constants/` - Shared constants (status codes, error codes)
- `types/` - TypeScript types and interfaces (if using TS)
- `config/` - Common configuration helpers

## Key Components
- Error handling middleware
- Logger wrapper (Winston/Bunyan)
- Request validation helpers
- JWT utilities
- HTTP status codes
- Common error codes

## Usage
Import shared modules in your service:
```javascript
import { errorHandler } from '../common/middlewares/errorHandler.js';
import { logger } from '../common/utils/logger.js';
```

## Best Practices
- Keep this library lean and focused
- Avoid service-specific logic
- Document all exports
- Version breaking changes carefully
