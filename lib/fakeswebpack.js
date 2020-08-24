const Compiler=require('./Compiler');
const EntryPlugin=require('./EntryPlugin');

const fakeSimpleWebpack=(options,callback)=>{

    compiler = new Compiler(options);
    compiler.options = options;

    // 内部自带插件 
    new EntryPlugin(options.entry, 'EntryPlugin').apply(compiler);

    //注册插件
    if (options.plugins){
        for (const plugin of options.plugins) {
            plugin.apply(compiler);
        }
    }

    if(callback){
        if (typeof callback !== "function") {
			throw new Error("Invalid argument: callback");
        }
        
        compiler.run(callback);
    }

    return compiler;
  

}


exports = module.exports = fakeSimpleWebpack;