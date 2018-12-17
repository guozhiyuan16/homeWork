// Range:bytes=0-5
// Content-Range: bytes 0-5/7877

let http = require('http');
let path = require('path');
let url = require('url');
let fs = require('fs');
let realPath = path.join(__dirname,'download.txt');
let statObj = fs.statSync(realPath);
http.createServer((req,res)=>{
    let range = req.headers['range'];
    if(range){
        let matchs =range.match(/(\d*)-(\d*)/);
        let [,start,end] = matchs; //let [,start=0,end=statObj.size] = matchs;  不能这么写空字符串也相当于有值
        start = start ?Number(start):0;
        end = end?Number(end):statObj.size;
        console.log(start,end);
        res.statusCode = 206;
        res.setHeader('Content-Range',`bytes ${start}-${end}/${statObj.size}`);
        res.setHeader('Content-Length',end-start+1);
        fs.createReadStream(realPath,{start,end}).pipe(res)
    }else{
        fs.createReadStream(realPath).pipe(res);
    }
}).listen(4000);