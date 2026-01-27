import mongoose from "mongoose";
import {env} from "../config/env.js";

export const connectMongo = async ()=>{
    try{
        await mongoose.connect(env.mongoUri);
        console.log("MONGODB CONNECTED")
    } catch{
        console.error("MONGO connection failed")
        process.exit(1)
    }
}