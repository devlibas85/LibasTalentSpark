import {connectMongo} from "./mongo.js";

export const connectDB = async ()=>{
    await connectMongo()
}