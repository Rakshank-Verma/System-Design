import {createClient} from "redis"

export const getRedisClient = async ()=>{
    try {
        const client = await createClient({
            url: "http://localhost:6379"
        }).connect()

        console.log("Redis is connected")
        return client
    } catch (error) {
        console.log(`Error in initializing redis-client`)
        throw error
    }
}