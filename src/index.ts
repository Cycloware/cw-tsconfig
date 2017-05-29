import * as path from 'path';
import * as fs from 'fs';
import stripBom = require('strip-bom')
import stripComments = require('strip-json-comments')

export interface ICompilerOptions {
  allowJs?: boolean;
  allowSyntheticDefaultImports?: boolean;
  allowUnreachableCode?: boolean;
  allowUnusedLabels?: boolean;
  alwaysStrict?: boolean;
  charset?: string;
  checkJs?: boolean;
  declaration?: boolean;
  declarationDir?: string;
  disableSizeLimit?: boolean;
  downlevelIteration?: boolean;
  emitBOM?: boolean;
  emitDecoratorMetadata?: boolean;
  experimentalDecorators?: boolean;
  forceConsistentCasingInFileNames?: boolean;
  importHelpers?: boolean;
  inlineSourceMap?: boolean;
  inlineSources?: boolean;
  isolatedModules?: boolean;
  jsx?: string;
  lib?: string[];
  locale?: string;
  mapRoot?: string;
  maxNodeModuleJsDepth?: number;
  module?: string;
  moduleResolution?: string;
  newLine?: string;
  noEmit?: boolean;
  noEmitHelpers?: boolean;
  noEmitOnError?: boolean;
  noErrorTruncation?: boolean;
  noFallthroughCasesInSwitch?: boolean;
  noImplicitAny?: boolean;
  noImplicitReturns?: boolean;
  noImplicitThis?: boolean;
  noUnusedLocals?: boolean;
  noUnusedParameters?: boolean;
  noImplicitUseStrict?: boolean;
  noLib?: boolean;
  noResolve?: boolean;
  preserveConstEnums?: boolean;
  project?: string;
  reactNamespace?: string;
  jsxFactory?: string;
  removeComments?: boolean;
  skipLibCheck?: boolean;
  skipDefaultLibCheck?: boolean;
  sourceMap?: boolean;
  sourceRoot?: string;
  strict?: boolean;
  strictNullChecks?: boolean;
  suppressExcessPropertyErrors?: boolean;
  suppressImplicitAnyIndexErrors?: boolean;
  target?: string;
  traceResolution?: boolean;


  baseUrl?: string;
  out?: string;
  outDir?: string;
  outFile?: string;
  paths?: { [key: string]: string[] };
  rootDir?: string;
  rootDirs?: string[];
  types?: string[];
  /** Paths used to compute primary types search locations */
  typeRoots?: string[];
}

export interface IConfig {
  compileOnSave?: boolean;
  extends?: string;
  compilerOptions?: ICompilerOptions;
  include?: string[];
  exclude?: string[];
  files?: string[];
}

export interface IConfigInfo {
  extendingConfig: string | 'root';
  level: number;
  inputtedPath: string;
  resolvedPath: string;
}

export interface IConfigResultBase extends IConfigInfo {
  status: 'good' | 'error';

  messages?: string[];
}

export interface IConfigResultError extends IConfigResultBase {
  status: 'error';
}

export interface IConfigResultGood extends IConfigResultBase {
  status: 'good';

  config: IConfig;
}

export type IConfigResult = IConfigResultGood | IConfigResultError;

export interface IConfigHierarchyResultBase {

  status: 'good' | 'error';

  inputtedPath: string;
  resolvedPath: string;

  maxLevels: number;
  levelsProcessed: number;
  hierarchy: IConfigResult[];

  issueItems: IConfigResult[];
}

export interface IConfigHierarchyResultGood extends IConfigHierarchyResultBase {
  status: 'good';
  config: IConfig;
}

export interface IConfigHierarchyResultError extends IConfigHierarchyResultBase {
  status: 'error';
}

export type IConfigHierarchyResult = IConfigHierarchyResultGood | IConfigHierarchyResultError;

type ILoadContext = {
  inputtedPath: string;
  resolvedPath: string;
  maxLevels: number;
  levelsProcessed: number;
  hierarchy: IConfigResult[];
}

export function loadConfigHierarchy(configFileName: string, maxLevels = 10): IConfigHierarchyResult {
  if (maxLevels < 1) {
    maxLevels = 1;
  }
  const inputtedPath = configFileName;
  if (!path.isAbsolute(configFileName)) {
    configFileName = path.resolve(configFileName);
  }

  const configInfo: IConfigInfo = {
    extendingConfig: 'root',
    level: 0,
    inputtedPath,
    resolvedPath: configFileName,
  };

  const context: ILoadContext = {
    inputtedPath: configInfo.inputtedPath,
    resolvedPath: configInfo.resolvedPath,
    maxLevels,
    levelsProcessed: 0,
    hierarchy: [],
  };

  const lastResult = recurseParseConfigFileSync(configInfo, context);
  const { hierarchy } = context;
  const issueItems: IConfigHierarchyResult['issueItems'] = [];
  // const configs: IConfig[] = [];
  const combinedConfig: IConfig = {};
  for (const item of hierarchy) {
    if (item.status === 'good') {
      Object.assign(combinedConfig, item.config);
    }
    const { messages } = item;
    if (messages) {
      issueItems.push(item);
      issueItems[item.level] = item;
    }
  }

  if (lastResult.status === 'good') {
    return {
      status: 'good',
      config: combinedConfig,
      ...context,
      issueItems,
    };
  }
  else {
    return {
      status: 'error',
      ...context,
      issueItems,
    }
  }
}

function recurseParseConfigFileSync(info: IConfigInfo, context: ILoadContext): IConfigResult {
  function intRecurseParseConfigFileSync(info: IConfigInfo, context: ILoadContext): IConfigResult {
    if (!(info.level < context.maxLevels)) {
      const { extendingConfig, level, resolvedPath, inputtedPath } = info;
      const { maxLevels } = context;
      return {
        status: 'error',
        messages: [
          `Max inheritance level ${maxLevels} reached for config file '${resolvedPath} at coming from '${extendingConfig}''`,
          `MaxLevel: ${maxLevels}`,
          `Fullpath: ${resolvedPath}`,
        ],
        ...info,
      }
    }
    const result = parseConfigFileSync(info);
    if (result.status === 'good') {
      const { extends: relativeExtendsPath } = result.config;
      if (relativeExtendsPath) {
        const { resolvedPath } = info
        const currentConfigDir = path.dirname(resolvedPath);
        const resolvedExtendsPath = path.resolve(currentConfigDir, relativeExtendsPath);

        const newInfo: IConfigInfo = {
          ...info,
          inputtedPath: relativeExtendsPath,
          resolvedPath: resolvedExtendsPath,
          level: info.level + 1,
        }
        return recurseParseConfigFileSync(newInfo, context);
      } else {
        return result;
      }
    }
    else {
      return result;
    }
  }
  const ret = intRecurseParseConfigFileSync(info, context);
  context.levelsProcessed++;
  context.hierarchy.push(ret);
  return ret;
}



function parseConfigFileSync(info: IConfigInfo): IConfigResult {
  const { resolvedPath } = info;
  try {
    const rawContants = fs.readFileSync(resolvedPath, 'utf8')

    try {
      const config: IConfig = parseConfigText(rawContants);
      return {
        status: 'good',
        config,
        ...info,
      }
    }
    catch (err) {
      const { extendingConfig, level, inputtedPath } = info;
      return {
        status: 'error',
        messages: [
          `Failed to parse config file '${resolvedPath} at level ${level} from '${extendingConfig}''`,
          `Parse error: ${err}`,
          `Fullpath: ${resolvedPath}`,
        ],
        ...info,
      }
    }
  }
  catch (err) {
    const { extendingConfig, level, inputtedPath } = info;
    return {
      status: 'error',
      messages: [
        `Failed to read config file '${resolvedPath} at level ${level} from '${extendingConfig}', it was inputted as '${inputtedPath}'`,
        `Fullpath: ${resolvedPath}`,
        `File read error:  ${err}`,
      ],
      ...info,
    }
  }
}

export function parseConfigText(contents: string) {
  const cleanContents = stripComments(stripBom(contents))

  // A tsconfig.json file is permitted to be completely empty.
  if (/^\s*$/.test(cleanContents)) {
    return {}
  }

  return JSON.parse(cleanContents)
}
