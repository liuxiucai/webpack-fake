const {
	Tapable,
	SyncHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");

const Compilation = require("./Compilation");

class Compiler extends Tapable {
	constructor(options) {
        super();
        this.hooks = {
            beforeRun: new AsyncSeriesHook(["compiler"]),
            run: new AsyncSeriesHook(["compiler"]),
            emit: new AsyncSeriesHook(["compilation"]),
            compilation: new SyncHook(["compilation", "params"]),
            compile: new SyncHook(["params"]),
            make: new AsyncParallelHook(["compilation"]),
            afterCompile: new AsyncSeriesHook(["compilation"]),
            failed: new SyncHook(["error"]),
            done: new AsyncSeriesHook(["stats"])
        };
        this.options=options;
    };

    run(callback){

        const finalCallback=(err,stats)=>{
			if (err) {
				this.hooks.failed.call(err);
			}
			if (callback !== undefined) return callback(err, stats);
        }

        const onCompiled = (err,compilation) => {
            if (err) return finalCallback(err);
           
            this.hooks.emit.callAsync(compilation, err => {
                if (err) return callback(err);
            });
            
        }

        //开始执行.....
        this.hooks.beforeRun.callAsync(this, err => {
            if (err) return finalCallback(err);

            this.hooks.run.callAsync(this, err => {
                if (err) return finalCallback(err);
                this.compile(onCompiled);
            });
        });


    }

    newCompilationParams() {
		const params = {
			//normalModuleFactory: this.createNormalModuleFactory(),
		};
		return params;
	}
    
    createCompilation() {
		return new Compilation(this);
	}

	newCompilation(params) {
		const compilation = this.createCompilation();
		this.hooks.compilation.call(compilation, params);
		return compilation;
    }
    
    compile(callback) {
        //正儿八经开始做事了....
        const params = this.newCompilationParams();
        this.hooks.compile.call(params);
        const compilation = this.newCompilation(params);
        //make开始正在编译->EntryPlugin插件是正在的开始
        this.hooks.make.callAsync(compilation, err => {
            if (err) return callback(err);
            //compilation执行编译
            compilation.finish(err => {
                if (err) return callback(err);
                compilation.seal(err => {
                    if (err) return callback(err);
                    this.hooks.afterCompile.callAsync(compilation, err => {
                        if (err) return callback(err);
                        return callback(null, compilation);
                    });
                })
            })
        })
    }

}

module.exports = Compiler;