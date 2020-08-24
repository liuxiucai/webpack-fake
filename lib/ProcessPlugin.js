
"use strict";


class ProcessPlugin {

	constructor() {
	       
    }
    
	apply(compiler) {
		compiler.hooks.beforeRun.tapAsync(
			"ProcessPlugin",
			(compiler, callback) => {
                console.log('beforeRun..........');
                callback();
			}
        );

        compiler.hooks.run.tapAsync(
			"ProcessPlugin",
			(compiler, callback) => {
                console.log('run..........');
                callback();
			}
        );

        compiler.hooks.compilation.tap(
			"ProcessPlugin",
			(compiler) => {
                console.log('compilation..........');
			}
        );
        

        compiler.hooks.emit.tapAsync(
			"ProcessPlugin",
			(compiler, callback) => {
                console.log('emit..........');
                callback();
			}
        );

        compiler.hooks.compilation.tap('ProcessPlugin', 
                (compilation) => {
                    compilation.hooks.buildModule.tap("ProcessPlugin",(mds)=>{
                        console.log(`compilation buildModule ${mds}.....`)
                    })
                }
        )
        
    }

}

module.exports = ProcessPlugin;
