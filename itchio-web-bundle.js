/*
	This script will zip the build directory and copy it to dist directory,
	it uses archiver plugin to do the zipping
*/

import fs from 'fs';
import archiver from 'archiver';
import pkg from './package.json' assert { type: 'json' };

// create the destination directory if it does not exist
if (!fs.existsSync('.dist/web/')) {
	fs.mkdirSync('.dist/web/', { recursive: true });
}

// zip the build directory and copy the zipped file into dist directory
const source_dir = 'build';
const output_file = `.dist/web/OpenTG-web-v${pkg.version}.zip`;
const output = fs.createWriteStream(output_file);
const archive = archiver('zip');

output.on('close', function () {
	console.log('Archived: ' + archive.pointer() + ' total bytes');
});

archive.on('error', function (err) {
	throw err;
});

archive.pipe(output);

// putting directory contents at the root of archive
archive.directory(source_dir, false);

archive.finalize();