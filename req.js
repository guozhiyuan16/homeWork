let path = require('path');
let fs = require('fs');
let vm = require('vm');

function Module(id) {
    this.id = id;
    this.exports = {}
}

Module.warp = function (script) {
    return `(function (exports, require, module, __filename, __dirname) {
      ${script}
  })`
};

Module._extensions = {
    '.js'(module) {
        let content = fs.readFileSync(module.id, 'utf8');
        let fnStr = Module.warp(content);

        let fn = vm.runInThisContext(fnStr);

        fn.call(module.exports, module.exports, req, module)
    },
    '.json'(module) {
        let content = fs.readFileSync(module.id, 'utf8');
        module.exports = JSON.parse(content);
    }
};

Module._findPath = function (paths) {

    let fileName;

    function fsExistsSync(path) {
        try {
            fs.accessSync(path, fs.F_OK);
        } catch (e) {
            return false;
        }
        return true;
    }

    for (let i = 0; i < paths.length; i++) {
        let oldCur = paths[i];

        let cur = paths[i];

        cur = '.' + cur.slice(cur.lastIndexOf('/'));

        let result = fsExistsSync(cur);

        if (result) {
            fileName = oldCur;
            break
        }
    }

    return fileName;
};


Module._resolveLookupPaths = function (id) {
    let ary = ['js', 'json'];
    let paths = [];

    if (id.indexOf('js') > 0 || id.indexOf('json') > 0) {
        paths.push(path.join(__dirname, id));

    } else {
        ary.forEach((item) => paths.push(path.join(__dirname, `${id}.${item}`)));
    }

    return paths;
};

Module._resolveFilename = function (id) {
    let paths;
    let fileName;
    paths = Module._resolveLookupPaths(id);

    fileName = Module._findPath(paths);

    return fileName
};


Module._cache = {}

function req(p) {
    let filename = Module._resolveFilename(p);

    let cachedModule = Module._cache[filename];
    if (cachedModule) {
        return cachedModule.exports;
    }

    let module = new Module(filename);

    Module._cache[filename] = module;

    let extName = path.extname(module.id);

    Module._extensions[extName](module);

    return module.exports;
}


let s = req('./a');
req('./a');
req('./a');
console.log(s);
