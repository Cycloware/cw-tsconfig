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
    paths?: {
        [key: string]: string[];
    };
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
export declare type IConfigResult = IConfigResultGood | IConfigResultError;
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
export declare type IConfigHierarchyResult = IConfigHierarchyResultGood | IConfigHierarchyResultError;
export declare function loadConfigHierarchy(configFileName: string, maxLevels?: number): IConfigHierarchyResult;
export declare function parseConfigText(contents: string): any;
