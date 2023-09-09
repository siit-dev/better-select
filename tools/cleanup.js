/**
 * From https://raw.githubusercontent.com/tomchen/example-typescript-package
 * licence: MIT
 */

import fs from 'fs';
import Path from 'path';

const deleteFolderRecursive = path => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(file => {
      const curPath = Path.join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const folder = process.argv.slice(2)[0];
const dirname = Path.dirname(new URL(import.meta.url).pathname);

if (folder == 'demo') {
  deleteFolderRecursive(Path.join(dirname, '../docs/demo'));
  process.exit(0);
}

if (folder) {
  deleteFolderRecursive(Path.join(dirname, '../dist', folder));
} else {
  deleteFolderRecursive(Path.join(dirname, '../dist/esm'));
  deleteFolderRecursive(Path.join(dirname, '../dist/umd'));
  deleteFolderRecursive(Path.join(dirname, '../dist/types'));
}
