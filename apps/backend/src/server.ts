import {app} from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./database/index.js";


async function startServer(){
  // await connectDB()

  app.listen(env.port, ()=>{
    console.log(`Server is Running on http://localhost:${env.port}`);
  });
}

startServer()