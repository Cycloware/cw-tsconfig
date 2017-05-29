require('module-alias/register');

import * as TsConfig from '@cw/tsconfig';
import * as path from 'path';


const resolvedConfigPath = path.resolve(process.cwd(), './__proto/tsconfig.json');
const result = TsConfig.loadConfigHierarchy(resolvedConfigPath);

const { status, levelsProcessed } = result;
console.log(`status: ${status}; levelsProcessed: ${levelsProcessed}`);

if (result.status === 'good') {
  const { config: { compilerOptions, ...config } } = result;

  const { paths, baseUrl } = compilerOptions;

  const pathKeys = Object.keys(paths);
}
