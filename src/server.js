import express from "express"
import dotenv from "dotenv"
import { sessionMiddleware } from "./middleware/session.js"

import home from "./routes/index.js"
import auth from "./routes/auth.js"

// Load environment variables

dotenv.config()
const app = express()

app.use(express.json())
app.use(sessionMiddleware)

// Basic route
app.use("/", home)
app.use("/auth", auth)

// Start server
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001")
})
