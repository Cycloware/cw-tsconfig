require('module-alias/register');

// const tsnode = require('ts-node');
// require('tsconfig-paths/register');

import * as moment from 'moment';
import { Json } from '@cw/json';
import { db } from '@cw/db-mapper';

import { User } from '../sample-out/user';

import * as path from 'path';
import * as fs from 'fs';
import * as tsc from 'typescript';

const basePath = process.cwd();
const configRelativePath = './__proto/tsconfig.json';
const configResolvedPath = path.resolve(basePath, configRelativePath);
const configContent = fs.readFileSync(configResolvedPath).toString();

// const config = tsc.convertCompilerOptionsFromJson(configContent, basePath, configRelativePath);

const config = tsc.readConfigFile(configResolvedPath, path => fs.readFileSync(path).toString())

console.log(`Hekllo Bob!!!`);

const ds = db.defineModel;
User.viewEdit.buildEditView('extra_column')

User.viewEdit.buildEditView('extra_column', 'info_name_full')

const cs = User.viewEdit.buildEditView('info', 'hi')
// cs.fullType.info

// const ls = User.viewList.fullType.
