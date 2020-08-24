const path=require('path');
const ProcessPlugin=require('./lib/ProcessPlugin');
const fakeSimpleWebpack=require('./lib/fakeswebpack');

var webpackConfig={
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