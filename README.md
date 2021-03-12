
## 窥探Webpack
<br/>
<br/>

### `为什么前端需要模块化及问题?`
<br/>

随着前端业务的越来越复杂，现在的前端开发人员早已不是早期的"切图仔+网页美画工"，许多复杂的场景，需要借助很多开源库来完成，不同资源组合使用之后，就会出现代码冲突，依赖难管理，功能块重复等问题，前端模块化主要解决这类问题。由于历史原因前端相关技术及相关理论，对同类问题有不同的处理方式，其中就包括了模块化的规范，目前最流行的有CommonJS，AMD,CMD,ES6等模块化规范,各类模块化规范在使用场景，运行时都有差异，例如CommonJS适用于服务端编程（Node）,AMD与CMD虽适用浏览器，但二者在规范细节也有不小的差异，例如 AMD推崇依赖前置，CMD推崇依赖就近，虽然功能无差别，思想上有出入，反应到了写法细节上。最后ES6模块功能在语言的标准上实现，目前来看完全可以取代Commonjs与AMD/CMD规范，成为通用的模块化解决方案，其主要特点静态化，其特点可以做一些代码分析。如此多的模块化资源，往往还要组合使用，所以需要对此做进一步资源打包处理。
<br/>
<br/>

### `为什么需要模块打包?`
<br/>

往往项目中含有JS,CSS,HTML,模板,字体,图片等各类资源需要处理（优化，组合，按需..），最开始是手动管理包括图片的压缩，样式压缩，模板处理，随着数量增加，手动解决已难以维持，为此产生Grunt,Gulp等工具，来自动化构建，后又出现了集成化打包工具Webpack,Parcel,Rollup等如其目的主要提升开发体验，提高开发效率，资源组织，编译，优化，发布等各类问题，前端正朝着“工程化”的方向发展。<br/><br/>


### `为什么选择Webpack来作为模块打包工具？`
<br/>

近些年最流行莫过于Webpack，它最核心的能力就是解决模块间的依赖问题,相比其他构建打包工具有如下优势:

* 1: Webpack支持多种模块标准，包括CommonJS，AMD,CMD,ES6等，尤其对一个复杂项目中依赖多种模块规范的库，
* 2: 除了JS，webpack还可以把CSS,HTML,模板,字体,图片等各类资源打包成模块建立清晰的依赖关系
* 3: 提供了许多优化资源方案例如code splitting,tree shaking,提取，压缩，souce Map...以及强大的社区生态。<br/>
<br/>

### `为什么Webpack这么强悍?`
<br/>

Webpack除了内置功能外，社区提供了非常多的"库"扩展了webpack的能力，Webpack有一套自己的生命周期，你也可以理解为打包一个资源的处理管道。生命周期中每个特定钩子（或者当事件理解-`但钩子与事件有一定区别`）都会对外开放都让外部可订阅如: `初始化阶段 run , 编译阶段 make build-module ,输出阶段 emit done` 等。<br/><br/>

### `钩子(插件)机制是怎么实现的？`
<br/>

Tapable.js简介:

更多请移步官网 https://github.com/webpack/tapable

tapable 对外暴露了很多钩子类，这些钩子类主要为插件创建钩子


``` javascript
	SyncHook,  
	SyncBailHook,  
	SyncWaterfallHook, 
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
```


### 如何使用

钩子类创建钩子

``` js
const hookTest = new SyncHook(["arg1", "arg2", "arg3"]);
```

注册钩子:

``` js

tapPromise // AsyncxxxHook
tapAsync // AsyncxxxHook
tap //Sync

hookTest.tap('plugin',()=>{
    //xxx
})

```
调用钩子函数

``` js

// call --Sync
// callAsync  --AsyncxxxHook
// promise  --AsyncxxxHook

hookTest.call();

```

更多例子

https://github.com/liuxiucai/tapable-demo

钩子根据如下条件来决定注册钩子的插件如何执行:

* 注册插件个数
* 钩子类型 (Bail, Waterfall, Parallel)
* 调用方式 (sync, async, promise)
* 参数个数
* 是否有拦截
<br/>
<br/>


### `钩子类型`

每个钩子能监听多个或者一个函数:

* 钩子名称中没有 “Waterfall”, “Bail” , “Loop” 关键字的就是钩子，所有注册的函数，按注册顺序执行

* __Waterfall__.  waterfall 钩子所注册函数，也是按注册的顺序执行，与普通钩子的区别，注册的函数的返回值可传递给下一个注册海曙使用

* __Bail__.  bail 钩子，可提前推出执行，当注册盖钩子的函数有任务的返回值时，其它注册函数江不再执行。

* __Loop__. loop钩子，所注册该钩子的函数必须全部返回undefined,否则一直执行

所有钩子类型都能 赋加 “Sync”,“AsyncSeries”, “AsyncParallel”等关键字，标识钩子特性：

* __Sync__. 同步钩子仅能监听同步性质函数（例如： `myHook.tap()`）

* __AsyncSeries__. 异步串行钩子能监听同步，异步，promise化性质的函数  (例如 `myHook.tap()`, `myHook.tapAsync()` , `myHook.tapPromise()`). 按注册的顺序，异步执行监听的函数

* __AsyncParallel__.异步并行钩子能监听同步，异步，promise化性质的函数 (例如 `myHook.tap()`, `myHook.tapAsync()`, `myHook.tapPromise()`). 并行执行所有的注册函数

综合上述通过类名,查看其中的关键字，就可知道该钩子类的特性 例如
`AsyncSeriesWaterfallHook` 串行执行异步函数，并且函数的返回，会传入的到一个函数使用
<br/>
<br/>

### `相关实现原理介绍`
<br/>

通过`钩子类型关键字，调用方式等信息动态创建了一个“代理”函数并在其代理函数内部收集了注册的所有函数，
并按规则生成了控制注册函数执行方式`，类似有点元编程的味道，动态修改代码的执行逻辑，其巧妙的流程解耦设计，值得在其他项目借鉴学习
也有种AOP 味道，把需注册的函数当 成 “切面“ 而对外暴露钩子就是 “切入点“。

<br/>

### `简单的同步钩子源代码分析为例`
<br/>

`动态创建函数控制执行钩子函数`<br/>

![webapck-tapable-02](https://bgl.zbjimg.com/bgl/bjclound/2021/03/12/1.png/origine/724fbb9a-e744-4b32-b96d-e8bfd9fbc576?imageMogr2/auto-orient/strip/quality/90)

`获取所有注册的钩子函数`<br/>

![webapck-tapable-01](https://bgl.zbjimg.com/bgl/bjclound/2021/03/12/3.png/origine/5c8b4f15-0141-42dc-ae67-f52744553de6?imageMogr2/auto-orient/strip/quality/90)

<br/>

![webapck-tapable-03](https://bgl.zbjimg.com/bgl/bjclound/2021/03/12/2.png/origine/6bad60b1-92ac-4fcd-97ca-e4c3fb9e0e48?imageMogr2/auto-orient/strip/quality/90)<br/><br/>

`生成执行钩子的函数` <br/>
![webapck-tapable-04](https://bgl.zbjimg.com/bgl/bjclound/2021/03/12/4.png/origine/d94f8493-3dbc-4bd4-8f2d-b523a3fe6d9c?imageMogr2/auto-orient/strip/quality/90)
<br/><br/>

## `实现一个Webpack`
<br/>

`到这里了我们大概知道了tapable能些什么，为了加固印象，我们自己来实现一个带简单插件功能的Webpack，支持简要生命周期`


更详细的实现请移步：

https://github.com/liuxiucai/webpack-fake

<br/>

### 项目结构 <br/>
<br/>

│ fakedist 打包输出目录 <br/>
│
├─lib  核心构建代码<br/>
│  ├─js<br/>
│  │      Compilation.js 核心模块处理<br/>
│  │      Compiler.js 整个核心编译流程<br/>
│  │      EntryPlugin.js 构建入口内置入口插件<br/>
│  │      fakeswebpack.js 启动入口<br/>
│  │      NormalModuleFactory.js 模块工厂<br/>
│  │      ProcessPlugin.js  打印构建流程插件（模拟三方插件）<br/>
├─src  待打包源代码<br/>
│  ├─js<br/>
│  │      hello.js <br/>
│  │      helloword.js <br/>
│  │      index.js  启动入口<br/>
│  │      word.js<br/>
│
└─fake.simple.webpack.config.js  配置文件 <br/>
<br/>


`fake.simple.webpack.config.js`

支持简单入口，输出，插件配置

``` js

const path=require('path');
const ProcessPlugin=require('./lib/ProcessPlugin');
const fakeSimpleWebpack=require('./lib/fakeswebpack');

let webpackConfig={
    entry:path.join(__dirname,'./src/index.js'),
    output:{
        path:path.join(__dirname,'./fakedist'),
        filename:'main.js'
    },
    plugins:[
        new ProcessPlugin()
    ]
}

fakeSimpleWebpack(webpackConfig,()=>{})

```

`fakeswebpack.js`

读取配置之后，开始编译资源前准备，通过配置参数创建Compiler，注册插件，


``` js
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

```

`Compiler.js `

开始编译-定义生命周期管道

``` js
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

    //省略...
	
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

```


`Compilation.js `

真正的资源处理-模块处理，资源封装，模块实现

``` js
const {
	Tapable,
	SyncHook,
	AsyncSeriesHook
} = require("tapable");

// @babel 相关依赖

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
        //xx
    }
    //依赖分析
    moduleAnalyser(entry){
        //xx
        return {
            entry,
            dependencies,
            code
        }
    }
	//处理模块
    buildModule(entry){
        //xx
        this.hooks.buildModule.call(this.modules);
    }
    // 资源封装
    seal(callback) {
        this.hooks.seal.call();
		//xx
        return callback();
    }
}

module.exports = Compilation;

```

<br/>
<br/>


### `有错误的地方欢迎大家指出，谢谢！`

