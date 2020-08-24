
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
                require("f:\\webpack分享\\fake-simple-webpack\\src\\index.js")
            })({"f:\\webpack分享\\fake-simple-webpack\\src\\index.js":{"dependencies":{"./helloword.js":"f:\\webpack分享\\fake-simple-webpack\\src\\helloword.js"},"code":"\"use strict\";\n\nvar _helloword = _interopRequireDefault(require(\"./helloword.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nalert(_helloword[\"default\"]);"},"f:\\webpack分享\\fake-simple-webpack\\src\\helloword.js":{"dependencies":{"./hello.js":"f:\\webpack分享\\fake-simple-webpack\\src\\hello.js","./word.js":"f:\\webpack分享\\fake-simple-webpack\\src\\word.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _hello = require(\"./hello.js\");\n\nvar _word = require(\"./word.js\");\n\nvar helloWord = \"\".concat(_hello.hello, \" \").concat(_word.word);\nvar _default = helloWord;\nexports[\"default\"] = _default;"},"f:\\webpack分享\\fake-simple-webpack\\src\\hello.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.hello = void 0;\nvar hello = 'hello';\nexports.hello = hello;"},"f:\\webpack分享\\fake-simple-webpack\\src\\word.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.word = void 0;\nvar word = 'word';\nexports.word = word;"}});
        