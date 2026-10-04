import { getRedisClient } from "../../config/redis/client.js"
import { redis } from "../../app.js"
import { resolve } from "node:dns"

export const getKeyValue = async (key: string) => {

    const value = await redis.get(key)

    if (value != null) {
        console.log("Cache HIT")
        return value
    }
    console.log("Cache MISS");

    const leaseKey = `lease:${key}`;

    const token = `${process.pid}-${Date.now()}-${Math.random()}`;

    const lease = await redis.set(leaseKey, token, {
        condition: "NX",
        expiration: {
            type: "EX",
            value: 10
        },
    })

    if (lease == "OK") {
        console.log("Lease acquired")

        // Get value from db --> for now just hardcode the value in dbVal
        const dbVal = 202

        await redis.set(key, dbVal)

        await releaseLease(key, token)

        return dbVal
    }

    console.log("Lease already acquired")

    for (let i = 0; i < 10; i++) {

        await new Promise(resolve => setTimeout(resolve, 100));

        const price = await redis.get(key);

        if (price !== null) {
            console.log("CACHE FILLED BY OTHER REQUEST");

            return Number(price);
        }
    }

    throw new Error("Could not get price");

}

const releaseLease = async (leaseKey: string, token: string) => {
    // LUA script to check and delete the lease at once not in two go
    const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

    await redis.eval(script, {
        keys: [leaseKey],
        arguments: [token]
    });
}