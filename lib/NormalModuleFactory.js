const {
	Tapable,
	SyncWaterfallHook,
	SyncBailHook,
	SyncHook,
	HookMap
} = require("tapable");

class NormalModuleFactory extends Tapable {
	constructor(context, resolverFactory, options) {
		super();
		this.hooks = {
			resolver: new SyncWaterfallHook(["resolver"]),
            factory: new SyncWaterfallHook(["factory"]),
            createModule: new SyncBailHook(["data"]),
			module: new SyncWaterfallHook(["module", "data"]),
            createParser: new HookMap(() => new SyncBailHook(["parserOptions"])),
            parser: new HookMap(() => new SyncHook(["parser", "parserOptions"])),
        };
        this.resolverFactory = resolverFactory;

        this.hooks.factory.tap("NormalModuleFactory", () => (result, callback) => {
            let resolver = this.hooks.resolver.call(null);
            
            resolver(result, (err, data) => {

                if (err) return callback(err);
                if (!data) return callback();
                
                let createdModule = this.hooks.createModule.call(result);
                createdModule = new NormalModule(result);
                createdModule = this.hooks.module.call(createdModule, result);
                return callback(null, createdModule);
            })
        })

        this.hooks.resolver.tap("NormalModuleFactory", () => (data, callback) => {
            //加载loader
            return callback(null, {
                resource
            });
        })
    };

    create(data, callback) {
        const result = data.result;
        const factory = this.hooks.factory.call(null);
        factory(result, (err, module) => {
            callback(null, module);
        })
    }

    createParser(type, parserOptions = {}) {
        const parser = this.hooks.createParser.for(type).call(parserOptions);
        if (!parser) {
            throw new Error(`No parser registered for ${type}`);
        }
        this.hooks.parser.for(type).call(parser, parserOptions);
        return parser;
    }

    getParser(type, parserOptions) {
        return this.createParser(type, parserOptions);
    }
   
}

module.exports = NormalModuleFactory;