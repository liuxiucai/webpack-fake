
"use strict";


class EntryPlugin {

	constructor(entry, name) {
		this.entry = entry;
		this.name = name;
    }
    
	apply(compiler) {
		compiler.hooks.make.tapAsync(
			"EntryPlugin",
			(compilation, callback) => {
                const {entry, name } = this;
                compilation.addEntry(entry, name, callback);
			}
        );
    }

}

module.exports = EntryPlugin;
