import { Router } from "express";
import  { healthCheck} from "./health.controller.js"

const router = Router();
router.use('/',healthCheck);

export default router;