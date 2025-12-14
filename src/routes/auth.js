import { Router } from "express"
import config from "../config/index.js"
import netsuiteAuth from "../controllers/nsAuthController.js"
import mcpService from "../controllers/nsMCPService.js"

const router = Router()

// Basic route
router.get("/", (req, res) => {
  res.send("User Authentication")
})

// OAuth 2.0 routes
// Initiate OAuth 2.0 flow
router.get("/login", (req, res) => {
  console.log("Login request received")
  try {
    const { accountId, clientId, scope } = config.netsuite
    const sessionId = req.session.id

    if (!accountId || !clientId) {
      return res
        .status(400)
        .json({ error: "accountId and clientId are required" })
    }

    const headers = {
      accountId,
      clientId,
      scope: scope || "mcp",
      redirectUri: config.netsuite.redirectUri,
    }

    const authUrl = netsuiteAuth.getAuthorizationUrl(
      sessionId,
      headers,
      req.session
    )
    res.send({ authorizationUrl: authUrl })
  } catch (error) {
    console.error("Auth initiation error:", error)
    res.status(500).json({ error: "Failed to initiate OAuth flow" })
  }
})

// OAuth callback
router.get("/callback", async (req, res) => {
  try {
    const { code, state: sessionId, error } = req.query

    console.log("OAuth callback received:", {
      hasCode: !!code,
      hasSessionId: !!sessionId,
      error: error || "none",
    })

    if (error) {
      console.error("OAuth error from NetSuite:", error)
      // Send HTML that closes popup and notifies parent window
      return res.send(`
                <html>
                    <body>
                        <script>
                            window.opener.postMessage({ type: 'oauth_error', error: '${error}' }, '*');
                            window.close();
                        </script>
                        <p>Authorization failed. You can close this window.</p>
                    </body>
                </html>
            `)
    }

    if (!code || !sessionId) {
      console.error("Missing code or sessionId in callback")
      return res.send(`
                <html>
                    <body>
                        <script>
                            window.opener.postMessage({ type: 'oauth_error', error: 'missing_code' }, '*');
                            window.close();
                        </script>
                        <p>Authorization failed. You can close this window.</p>
                    </body>
                </html>
            `)
    }

    console.log("Exchanging authorization code for tokens...")
    console.log("Using session ID:", sessionId)

    // Exchange code for tokens (pass the express session object)
    const tokens = await netsuiteAuth.exchangeCodeForTokens(code, req.session)

    console.log("Token exchange successful, storing in session")

    // Calculate expiration time
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString()

    // Store tokens in session including clientId for refresh
    req.session.netsuiteTokens = {
      ...tokens,
      expiresAt,
      clientId: req.session.pkce?.config?.clientId, // Store clientId for token refresh
    }
    req.session.isAuthenticated = true

    // Create refresh token callback
    // const refreshTokenCallback = async () => {
    //   console.log("Refreshing NetSuite token...")
    //   const newTokens = await netsuiteAuth.refreshAccessToken(
    //     req.session.netsuiteTokens.refresh_token,
    //     {
    //       accountId: tokens.accountId,
    //       clientId: req.session.netsuiteTokens.clientId, // Need clientId for public client refresh
    //     }
    //   )

    //   // Update session with new tokens
    //   const newExpiresAt = new Date(
    //     Date.now() + newTokens.expires_in * 1000
    //   ).toISOString()
    //   req.session.netsuiteTokens = {
    //     ...req.session.netsuiteTokens,
    //     ...newTokens,
    //     expiresAt: newExpiresAt,
    //   }

    //   return {
    //     ...newTokens,
    //     expiresAt: newExpiresAt,
    //   }
    // }

    // Initialize MCP connection with the new tokens
    console.log("Initializing MCP connection...", { tokens, expiresAt })
    const { tools } = await mcpService.initializeMCPConnection(
      req.session.id,
      {
        accountId: tokens.accountId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      }
      // refreshTokenCallback
    )

    console.log("OAuth flow completed successfully")

    // Send HTML that closes popup and notifies parent window
    res.send(tools)
    // res.send(`
    //         <html>
    //             <body>
    //                 <script>
    //                     window.opener.postMessage({ type: 'oauth_success' }, '*');
    //                     window.close();
    //                 </script>
    //                 <p>Authorization successful! This window should close automatically.</p>
    //             </body>
    //         </html>
    //     `)
  } catch (error) {
    console.error("OAuth callback error:", error)
    res.send(`
            <html>
                <body>
                    <script>
                        window.opener.postMessage({ type: 'oauth_error', error: 'auth_failed' }, '*');
                        window.close();
                    </script>
                    <p>Authorization failed. You can close this window.</p>
                </body>
            </html>
        `)
  }
})

export default router
