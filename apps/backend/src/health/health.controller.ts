export const  healthCheck = (_req: any, res:any)=>{
    res.json({
        status:"ok",
        service: "LibasTalentSpark API",
        timeStamp :new Date().toISOString(),
    })
}
