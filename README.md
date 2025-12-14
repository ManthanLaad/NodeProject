# NS AI Bot

An intelligent Node.js application that integrates NetSuite with Google Gemini AI through the Model Context Protocol (MCP), enabling seamless OAuth 2.0 authentication and AI-powered chatbot functionality.

## Overview

NS AI Bot is a backend service that connects NetSuite's business data with Google's Gemini AI model. It provides:

- **Secure OAuth 2.0 Authentication** with NetSuite using PKCE (Proof Key for Code Exchange)
- **MCP Integration** for accessing NetSuite data through AI models
- **Session Management** for maintaining user authentication state
- **RESTful API** endpoints for authentication and chat operations

## Features

- 🔐 **Secure OAuth 2.0 Flow** - PKCE-compliant authentication with NetSuite
- 🤖 **AI Integration** - Powered by Google Gemini API
- 💾 **Session Persistence** - File-based session storage for reliability
- 🔄 **MCP Service** - Model Context Protocol implementation for NetSuite integration
- 🛡️ **Error Handling** - Comprehensive error middleware
- 📦 **Hot Reloading** - Development server with Nodemon

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5.2.1
- **Authentication:** OAuth 2.0 with PKCE
- **Session Management:** express-session with file-based store
- **HTTP Client:** Axios
- **Environment:** dotenv
- **Development:** Nodemon

## Project Structure

```
src/
├── server.js                 # Express app initialization and server startup
├── config/
│   └── index.js             # Configuration and environment variables
├── controllers/
│   ├── nsAuthController.js   # NetSuite OAuth 2.0 authentication logic
│   └── nsMCPService.js       # Model Context Protocol service implementation
├── middleware/
│   ├── error.js             # Global error handling middleware
│   └── session.js           # Express session middleware configuration
├── routes/
│   ├── index.js             # Root/home routes
│   ├── auth.js              # Authentication endpoints
│   └── chat.js              # Chat/AI interaction endpoints
└── utils/
    └── oauthClient.js       # OAuth client utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ (with ES Module support)
- NetSuite account with OAuth 2.0 app configured
- Google Gemini API key
- Environment variables configured

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ns-ai-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables by creating a `.env` file:

   ```env
   # Server Configuration
   PORT=3001
   BASE_URL=http://localhost:3001

   # NetSuite OAuth Configuration
   NS_CLIENT_ID=your_client_id
   NS_CLIENT_SECRET=your_client_secret
   NS_ACCOUNT_ID=your_account_id
   NS_AUTH_URL=https://{account_id}.app.netsuite.com/app/login/oauth2/authorize.nl
   NS_TOKEN_URL=https://{account_id}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token
   NS_SCOPE=mcp

   # OAuth 2.0 PKCE Configuration
   OAUTH_STATE_LENGTH=32
   PKCE_LENGTH=64
   PKCE_CODE_CHALLENGE_METHOD=sha256

   # AI Configuration
   AI_API_KEY=your_gemini_api_key
   ```

### Running the Application

**Development mode** (with hot reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication Routes (`/auth`)

#### Initiate OAuth Flow

```
GET /auth/login
```

Returns an authorization URL for NetSuite OAuth 2.0 flow.

**Response:**

```json
{
  "authorizationUrl": "https://{account_id}.app.netsuite.com/app/login/oauth2/authorize.nl?..."
}
```

#### OAuth Callback

```
GET /auth/callback?code={auth_code}&state={state}
```

Handles the OAuth 2.0 callback from NetSuite. Exchanges authorization code for access tokens.

### Chat Routes (`/chat`)

Endpoints for AI-powered chat interactions with NetSuite data integration.

### Home Routes (`/`)

Basic status and health check endpoints.

## Authentication Flow

The application implements OAuth 2.0 with PKCE for enhanced security:

1. **User initiates login** → GET `/auth/login`
2. **Server generates PKCE challenge** → Creates code_verifier and code_challenge
3. **Redirect to NetSuite** → User authorizes access
4. **NetSuite redirects back** → GET `/auth/callback` with authorization code
5. **Exchange code for tokens** → Server uses PKCE verifier to get access token
6. **Session established** → User authenticated and session created

### PKCE Implementation

- **Code Verifier:** Cryptographically random string (64 characters)
- **Code Challenge:** SHA-256 hash of the verifier
- **Storage:** Express session (persists across server restarts)
- **Security:** Prevents authorization code interception attacks

## Configuration Details

The application uses environment variables for configuration, loaded via `dotenv`. Key configurations:

| Variable                     | Purpose                                               |
| ---------------------------- | ----------------------------------------------------- |
| `NS_CLIENT_ID`               | NetSuite OAuth application client ID                  |
| `NS_CLIENT_SECRET`           | NetSuite OAuth application client secret              |
| `NS_ACCOUNT_ID`              | NetSuite account ID (e.g., `1234567`)                 |
| `PKCE_LENGTH`                | Length of PKCE code verifier (43-128, recommended 64) |
| `PKCE_CODE_CHALLENGE_METHOD` | Hash method for PKCE (sha256 recommended)             |
| `AI_API_KEY`                 | Google Gemini API key                                 |

## Session Management

Sessions are managed using `express-session` with file-based storage:

- **Store:** Session file store (local filesystem)
- **Purpose:** Persist user authentication state and PKCE challenges
- **Benefits:** Survives server restarts without external dependencies

## Error Handling

The application includes comprehensive error handling:

- **Global error middleware** - Catches and formats errors consistently
- **Validation errors** - Request validation for OAuth flows
- **Authentication errors** - Clear error messages for OAuth failures
- **Session errors** - Handles missing or invalid sessions

## Development

### Code Style

- ES Module syntax (`import`/`export`)
- Async/await for asynchronous operations
- Modular controller and route structure

### Hot Reload

When running with `npm run dev`, Nodemon automatically restarts the server on file changes.

### Debugging

Enable detailed logging by examining console outputs:

- OAuth flow logs include PKCE challenge details
- Session validation logs
- Token exchange logs

## Security Considerations

✅ **PKCE Protection** - Prevents authorization code interception  
✅ **Session-based PKCE Storage** - Survives restarts without in-memory loss  
✅ **Environment Variables** - Sensitive data kept out of code  
✅ **OAuth 2.0 Standard** - Follows RFC 6749 and PKCE (RFC 7636)  
✅ **Secure Redirect URIs** - Whitelisted on NetSuite app configuration

## Troubleshooting

### "PKCE challenge not found in session"

- Ensure session middleware is initialized before auth routes
- Verify session store is working properly
- Check that cookies are enabled in the client

### "Missing code or sessionId in callback"

- Verify the redirect URI is correctly configured in NetSuite
- Check that state parameter is being passed correctly
- Ensure the callback URL matches the configured redirect URI

### Session not persisting

- Verify the `./sessions` directory exists and is writable
- Check file permissions on the session store directory
- Ensure `express-session` middleware is properly configured

## Dependencies

- **axios** (1.13.2) - HTTP client for API calls
- **express** (5.2.1) - Web framework
- **express-session** (1.18.2) - Session management
- **session-file-store** (1.5.0) - File-based session persistence
- **dotenv** (17.2.3) - Environment variable management
- **node-fetch** (3.3.2) - Fetch API for Node.js

## DevDependencies

- **nodemon** (3.1.11) - Auto-restart on file changes

## Author

Manthan Laad

## License

MIT

## Contributing

Contributions are welcome! Please ensure:

- All environment variables are documented in `.env.example`
- Error messages are descriptive and helpful
- Session handling is carefully tested
- OAuth flow changes maintain PKCE security

## Future Enhancements

- WebSocket support for real-time chat
- Advanced MCP resource caching
- Multi-user session management
- Rate limiting and API quotas
- Comprehensive API documentation (OpenAPI/Swagger)
- Unit and integration tests
