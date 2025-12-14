import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

export default {
  port: process.env.PORT || 3001,
  baseUrl: process.env.BASE_URL || "http://localhost:3001",
  netsuite: {
    clientId: process.env.NS_CLIENT_ID,
    clientSecret: process.env.NS_CLIENT_SECRET,
    redirectUri: `${process.env.BASE_URL}/auth/callback`,
    oauthAuthUrl: process.env.NS_AUTH_URL,
    oauthTokenUrl: process.env.NS_TOKEN_URL,
    scopes: process.env.NS_SCOPE,
    accountId: process.env.NS_ACCOUNT_ID,
  },
  oAuth: {
    stateLength: process.env.OAUTH_STATE_LENGTH || 32,
    pkce: {
      codeVerifierLength: Number(process.env.PKCE_LENGTH) || 64, // length between 43 and 128 recommended
      hashMethod: String(process.env.PKCE_CODE_CHALLENGE_METHOD) || "sha256",
    },
  },
  aiApiKey: process.env.AI_API_KEY,
}
