import express, { Request, Response } from "express"
import { getRedisClient } from "./config/redis/client.js"


const app = express()

app.use(express.json())

export const redis = await getRedisClient()

const PORT = 3000;

app.get('/health', async (req: Request, res: Response) => {
    return res.json({
        "success": true,
        "data": {
            "redis": await redis.ping() == "PONG" ? "healthy" : "Not healthy",
        },
        "error": null
    }).status(200)
})



app.listen(PORT, () => {
    console.log(`Server listening to http://localhost:${PORT}`)
})