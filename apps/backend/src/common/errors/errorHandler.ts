import type { Request, Response, NextFunction } from "express";

export const  errorHandler = (
    err:any,
    _req : Request,
    res:Response,
    _next: NextFunction
)=>{
    console.log(err);
    res.status(err.statusCode ||500).json({
        success:false,
        message :err.message || "Inernel Server Error"
    })
}
