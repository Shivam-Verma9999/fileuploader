const express = require("express");
const sql = require("mssql");
const app = express();
const fs = require("fs");
const {query} = require("./sqlQuery");
const sqlConfig = require("./DBConfig");
const PORT = 8080;


app.get("/", (req,res) =>  {
        res.end(fs.readFileSync("index.html"));
}).post("/upload", async (req, res)=>{
    console.log("UPLOAD REQ", req.headers["content-length"]);
    const fileName = req.headers["file-name"];
    const chunkID = req.headers["chunk-id"];
    const fileId = req.headers["file-id"];
    if(Number.parseInt(req.headers["content-length"]) == 0){
        res.end("No data to upload");
        return ;
        
    };
    let connection = await sql.connect(sqlConfig);
    let c = await connection.request()
    .input("fileId",sql.Int,fileId)
    .input("chunkId", sql.Int, chunkID)
    .query(`insert into tb_fileData(fda_fileId, fda_chunkId) values(@fileId, @chunkId); select SCOPE_IDENTITY() as tempID;`);
    console.log(`UPLOADED ${fileName}, ${chunkID}, ${fileId}, : `, c);
    req.on("data", data => {
        fs.appendFileSync(`${c.recordset[0].tempID}.temp`, data);
    });
    res.end("chunk uploaded");
}).get("/testsql", async (req, res) => {
    console.log("test sql...");
    try{
        
        let result = await query("select * from tb_filemetadata where fmd_filename = 'acb';");
        console.log("funct :", result);
        
    }catch(err){
        console.log(err);
    }
    res.end("DOne sql");
}).get("/file",async (req, res)=>{
    let result = await query("select fda_data from tb_filedata where fda_fileID=1 order by fda_chunkID ASC");
    let videoData =[]
    let contentLength = 0;
    result.recordset.forEach(dset => {
        fs.appendFileSync("a.mp4",dset.fda_data);
    });
    videoData = Buffer.concat(videoData);
    console.log(result.recordset[0].fda_data.length);
    res.setHeader("content-type","video/mp4");
    res.setHeader("content-length", contentLength)
    res.send(videoData);
    //console.log(result);

   // res.end("Adsfad");
}).post("/register", async (req, res) => {
    let fileName = req.headers["file-name"];
    let userId = 1;
    let connection  =  await sql.connect(sqlConfig);
    let response = await  connection.request()
    .input("fileName", sql.VarChar,fileName)
    .input("userId", sql.Int,userId)
    .query("insert into tb_fileMetaData(fmd_fileName, fmd_userId) values(@fileName, @userId); select SCOPE_IDENTITY() as fileId;");

    res.statusCode=200;
    res.send(JSON.stringify({
        status: "success",
        fileId: response.recordset[0].fileId
    }));
}).post("/uploadComplete", (req, res) => {
    let fileId = Number.parseInt(req.headers['file-id']);
    console.log("UPLOAD COMPLETE FOR : ", fileId);
    if(Number.isInteger(fileId) && fileId > 0) {
        query(`update tb_fileMetadata set fmd_uploaded = 1 where fmd_id = ${fileId}`);
        res.end("Uplaod Completed ");
    }
});

app.listen(PORT,(err)=>{
    if(err) {
        console.log(err);
    }else {
        console.log(`Listening on PORT: ${PORT}`);
    }
})