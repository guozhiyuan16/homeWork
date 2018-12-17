let http = require('http');
let path = require('path');
let fs = require('fs');
let start = 0;
let limit = 5;
const DOWN_LOAD_URL = path.join(__dirname,'load.txt');

// let options = {     // 同一地址
//     hostname:'localhost',
//     port:3000,
//     method:'get',
//     header:{
//         Range:`bytes=${start}-${start+limit-1}`
//     }
// }

let ws = fs.createWriteStream(DOWN_LOAD_URL);
let pause = false;

process.stdin.on('data',function (data) {
    if(data.includes('p')){
        pause = true;
    }else{
        pause = false;
        downLoad();
    }
})


function downLoad() {

    let options = {
        hostname:'localhost',
        port:4000,
        method:'get',
        headers:{
            Range:`bytes=${start}-${start+limit-1}`
        }
    }

    http.get(options,function (res) {
        // 把请求到的结果生成到当前目录下

        let total = res.headers['content-range'].split('/')[1];

        // 这样写每次download都会创建一个新流
        //res.pipe(fs.createReadStream(DOWN_LOAD_URL));
        //res.pipe(ws,{end:false});  // write after end --> 写完先别关

        res.on('data',function (chunk) {
            ws.write(chunk)
        });
        res.on('end',function () {
            start+=limit;
            if(total>start && pause === false){
                setTimeout(()=>{
                    downLoad();
                },1000);
            }else{
                // ws.end();
            }
        })
    })
}

downLoad();