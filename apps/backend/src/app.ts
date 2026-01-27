import express from 'express';
import cors from 'cors';
import  healthRouter  from "../src/modules/health/health.route.js"


export const app = express();
app.use(cors());
app.use(express.json());

app.get('/health',healthRouter);
