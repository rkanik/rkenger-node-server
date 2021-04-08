const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

try {
	fs.removeSync('./dist/');
	childProcess.exec('tsc --build tsconfig.prod.json', (error, _, stderr) => {
		if (error || stderr.length > 0) { throw error || stderr; }
		// fs.copySync(
		// 	path.join(__dirname, '../client/dist'),
		// 	path.join(__dirname, '../dist/public')
		// );
	});
}
catch (err) { console.log(err) }
