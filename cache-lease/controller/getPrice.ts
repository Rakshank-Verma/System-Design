import { Request, Response } from "express";
import {getKeyValue} from "../services/redis/redis-lease.js"

const getPrice = async (req: Request, res: Response)=>{
    try {
        const body = req.body()
        const keyValue = getKeyValue(body.key)
    } catch (error) {
        return res.json({
            "success": false,
            "data": null,
            "error": JSON.stringify(error),
        }).status(500)
    }
}