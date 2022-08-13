const path = require('path')
const fs = require('fs-extra');
const packagePath = path.resolve(__dirname, '../package.json')

exports.replaceModuleAliases = (from, to) => {
	let package = require(packagePath)
	package._moduleAliases =
		Object
			.entries(package._moduleAliases)
			.reduce(
				(acc, [key, value]) => ({
					...acc,
					[key]: value.replace(from, to)
				}),
				{}
			)
	fs.writeFileSync(packagePath, JSON.stringify(package, null, 2))
}
