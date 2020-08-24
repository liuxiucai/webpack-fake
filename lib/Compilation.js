const {
	Tapable,
	SyncHook,
	AsyncSeriesHook
} = require("tapable");

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');
const codeFrameColumns=require('@babel/code-frame').codeFrameColumns;

class Compilation extends Tapable {
    /**
     * 
     * @param {Compiler} compiler compiler创建compilation
     */
    constructor(compiler){
        super();
        this.hooks={
            addEntry: new SyncHook(["entry", "name"]),
            //开始编译Module
            buildModule: new SyncHook(["module"]),
            //编译完成
            finishModules: new AsyncSeriesHook(["modules"]),
            //封装编译的资源
            succeedEntry:new SyncHook([]),
            seal: new SyncHook([])
        },
        this.compiler = compiler;
        this.resolverFactory = compiler.resolverFactory;
        const options = compiler.options;
        this.outputOptions = options && options.output;
        this.options = options;
        this.modules = [];
    }

    moduleAnalyser(entry){
        //编译模块
        const content = fs.readFileSync(entry, 'utf-8');
        const ast = parser.parse(content, {
            sourceType: 'module'
        });
        const dependencies = {};
        
        // const resultast = codeFrameColumns(entry+" ast :"+JSON.stringify(ast), {}, {highlightCode:true});
        // console.log(resultast);

        traverse(ast, {
            ImportDeclaration({ node }) {
                const dirname = path.dirname(entry);
                const newFile =  path.join(dirname, node.source.value);
                dependencies[node.source.value] = newFile;
            }
        });

        const { code } = babel.transformFromAst(ast, null, {
            presets: ["@babel/preset-env"]
        });

        return {
            entry,
            dependencies,
            code
        }
    }

    buildModule(entry){

        const entryModule = this.moduleAnalyser(entry);
        this.modules = [ entryModule ];
        for(let i = 0; i < this.modules.length; i++) {
            const item = this.modules[i];
            const { dependencies } = item;
            if(dependencies) {
                for(let j in dependencies) {
                    this.modules.push(
                        this.moduleAnalyser(dependencies[j])
                    );
                }
            }
        }

        this.hooks.buildModule.call(this.modules);
        
    }

    addEntry(entry, name, callback) {
        this.hooks.addEntry.call(entry, name)

        this.buildModule(entry)

        this.hooks.succeedEntry.call(entry, name, this.modules);

        return callback(null, this.modules);
    }

    finish(callback) {
		this.hooks.finishModules.callAsync(this.modules, err => {
			if (err) return callback(err);
			callback();
		});
    }
    
    seal(callback) {
        this.hooks.seal.call();

        const graph = {};

        this.modules.forEach(item => {
            graph[item.entry] = {
                dependencies: item.dependencies,
                code: item.code
            }
        });

        //入口处此处解析模块依赖关系
        let modulesGraph=JSON.stringify(graph);

        // console.log(codeFrameColumns(`modues entrygraph :${modulesGraph}`, {}, {highlightCode:true}));


        let bundle= `
            (function(graph){
                function require(module) { 
                    function _fakewebpack(relativePath) {
                        return require(graph[module].dependencies[relativePath]);
                    }
                    var exports = {};
                    (function(require, exports, code){
                        eval(code)
                    })(_fakewebpack, exports, graph[module].code);
                    return exports;
                };
                require(${JSON.stringify(this.options.entry)})
            })(${modulesGraph});
        `;

        fs.writeFileSync(path.join(this.outputOptions.path,this.outputOptions.filename),bundle, 'utf-8');
       
        return callback();
    }

}

module.exports = Compilation;