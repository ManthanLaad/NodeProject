import qs from "querystring"
import config from "../config/index.js"

export async function exchangeCodeForToken(code, code_verifier, redirectUri) {
  const body = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: config.netsuite.clientId,
    code_verifier,
  }

  // If you have a confidential client (server-side), you may include client_secret:
  if (config.netsuite.clientSecret)
    body.client_secret = config.netsuite.clientSecret

  const res = await fetch(config.netsuite.oauthTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: qs.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${text}`)
  }
  return res.json() // typically { access_token, id_token, refresh_token, expires_in, token_type, ... }
}

export async function refreshToken(refresh_token) {
  const body = {
    grant_type: "refresh_token",
    refresh_token,
    client_id: config.netsuite.clientId,
  }
  if (config.netsuite.clientSecret)
    body.client_secret = config.netsuite.clientSecret

  const res = await fetch(config.netsuite.oauthTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: qs.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Refresh token failed: ${res.status} ${text}`)
  }
  return res.json()
}
