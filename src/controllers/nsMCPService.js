import axios from "axios"
import { EventEmitter } from "events"

class MCPService extends EventEmitter {
  constructor() {
    super()
    this.connections = new Map() // Store MCP connections per user
  }

  // Initialize MCP connection for a user (using NetSuite's native MCP REST API)
  async initializeMCPConnection(userId, netsuiteConfig, refreshTokenCallback) {
    try {
      console.log("Initializing MCP connection for user:", userId)
      console.log("Account ID:", netsuiteConfig.accountId)

      const connection = {
        accountId: netsuiteConfig.accountId,
        accessToken: netsuiteConfig.accessToken,
        refreshToken: netsuiteConfig.refreshToken,
        expiresAt: netsuiteConfig.expiresAt,
        refreshTokenCallback, // Store callback for token refresh
        tools: [],
        connected: false,
      }

      // Fetch available tools from NetSuite MCP API
      const tools = await this.fetchToolsList(
        netsuiteConfig.accountId,
        netsuiteConfig.accessToken
      )

      connection.tools = tools
      connection.connected = true

      this.connections.set(userId, connection)

      console.log(
        `MCP connection established with ${tools.length} tools available`
      )
      this.emit("connected", userId, connection.tools)

      return {
        success: true,
        message: "MCP connection initialized",
        tools,
        toolCount: tools.length,
      }
    } catch (error) {
      console.error("Failed to initialize MCP connection:", error)
      throw error
    }
  }

  // Fetch tools list from NetSuite MCP API
  async fetchToolsList(accountId, accessToken) {
    try {
      const url = `https://${accountId}.suitetalk.api.netsuite.com/services/mcp/v1/all`

      const response = await axios.post(
        url,
        {
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/list",
          params: {},
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      )

      console.log("Tools list response:", response.data)

      if (response.data.result && response.data.result.tools) {
        return response.data.result.tools
      }

      return []
    } catch (error) {
      console.error(
        "Error fetching tools list:",
        error.response?.data || error.message
      )

      // If 401 error, mark connection as failed (token expired)
      if (error.response?.status === 401) {
        console.error(
          "⚠️ NetSuite authentication failed - token expired or invalid"
        )
      }

      throw error
    }
  }
}

export default new MCPService()
