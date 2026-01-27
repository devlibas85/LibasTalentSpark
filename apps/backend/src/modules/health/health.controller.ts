export const  healthCheck = (_req: any, res:any)=>{
    res.json({
        status:"ok",
        service: "LibasTalentSpark API",
        timeStamp :new Date().toISOString(),
    })
}
export const getHealth = async () => {
  const res = await fetch("http://localhost:4000/health");
  return res.json();
};
