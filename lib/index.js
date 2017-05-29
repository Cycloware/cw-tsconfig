"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const stripBom = require("strip-bom");
const stripComments = require("strip-json-comments");
function loadConfigHierarchy(configFileName, maxLevels = 10) {
    if (maxLevels < 1) {
        maxLevels = 1;
    }
    const inputtedPath = configFileName;
    if (!path.isAbsolute(configFileName)) {
        configFileName = path.resolve(configFileName);
    }
    const configInfo = {
        extendingConfig: 'root',
        level: 0,
        inputtedPath,
        resolvedPath: configFileName,
    };
    const context = {
        inputtedPath: configInfo.inputtedPath,
        resolvedPath: configInfo.resolvedPath,
        maxLevels,
        levelsProcessed: 0,
        hierarchy: [],
    };
    const lastResult = recurseParseConfigFileSync(configInfo, context);
    const { hierarchy } = context;
    const issueItems = [];
    // const configs: IConfig[] = [];
    const combinedConfig = {};
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
        return Object.assign({ status: 'good', config: combinedConfig }, context, { issueItems });
    }
    else {
        return Object.assign({ status: 'error' }, context, { issueItems });
    }
}
exports.loadConfigHierarchy = loadConfigHierarchy;
function recurseParseConfigFileSync(info, context) {
    function intRecurseParseConfigFileSync(info, context) {
        if (!(info.level < context.maxLevels)) {
            const { extendingConfig, level, resolvedPath, inputtedPath } = info;
            const { maxLevels } = context;
            return Object.assign({ status: 'error', messages: [
                    `Max inheritance level ${maxLevels} reached for config file '${resolvedPath} at coming from '${extendingConfig}''`,
                    `MaxLevel: ${maxLevels}`,
                    `Fullpath: ${resolvedPath}`,
                ] }, info);
        }
        const result = parseConfigFileSync(info);
        if (result.status === 'good') {
            const { extends: relativeExtendsPath } = result.config;
            if (relativeExtendsPath) {
                const { resolvedPath } = info;
                const currentConfigDir = path.dirname(resolvedPath);
                const resolvedExtendsPath = path.resolve(currentConfigDir, relativeExtendsPath);
                const newInfo = Object.assign({}, info, { inputtedPath: relativeExtendsPath, resolvedPath: resolvedExtendsPath, level: info.level + 1 });
                return recurseParseConfigFileSync(newInfo, context);
            }
            else {
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
function parseConfigFileSync(info) {
    const { resolvedPath } = info;
    try {
        const rawContants = fs.readFileSync(resolvedPath, 'utf8');
        try {
            const config = parseConfigText(rawContants);
            return Object.assign({ status: 'good', config }, info);
        }
        catch (err) {
            const { extendingConfig, level, inputtedPath } = info;
            return Object.assign({ status: 'error', messages: [
                    `Failed to parse config file '${resolvedPath} at level ${level} from '${extendingConfig}''`,
                    `Parse error: ${err}`,
                    `Fullpath: ${resolvedPath}`,
                ] }, info);
        }
    }
    catch (err) {
        const { extendingConfig, level, inputtedPath } = info;
        return Object.assign({ status: 'error', messages: [
                `Failed to read config file '${resolvedPath} at level ${level} from '${extendingConfig}', it was inputted as '${inputtedPath}'`,
                `Fullpath: ${resolvedPath}`,
                `File read error:  ${err}`,
            ] }, info);
    }
}
function parseConfigText(contents) {
    const cleanContents = stripComments(stripBom(contents));
    // A tsconfig.json file is permitted to be completely empty.
    if (/^\s*$/.test(cleanContents)) {
        return {};
    }
    return JSON.parse(cleanContents);
}
exports.parseConfigText = parseConfigText;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHNDQUFzQztBQUN0QyxxREFBcUQ7QUEySXJELDZCQUFvQyxjQUFzQixFQUFFLFNBQVMsR0FBRyxFQUFFO0lBQ3hFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDaEIsQ0FBQztJQUNELE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQztJQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBZ0I7UUFDOUIsZUFBZSxFQUFFLE1BQU07UUFDdkIsS0FBSyxFQUFFLENBQUM7UUFDUixZQUFZO1FBQ1osWUFBWSxFQUFFLGNBQWM7S0FDN0IsQ0FBQztJQUVGLE1BQU0sT0FBTyxHQUFpQjtRQUM1QixZQUFZLEVBQUUsVUFBVSxDQUFDLFlBQVk7UUFDckMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxZQUFZO1FBQ3JDLFNBQVM7UUFDVCxlQUFlLEVBQUUsQ0FBQztRQUNsQixTQUFTLEVBQUUsRUFBRTtLQUNkLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBRywwQkFBMEIsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkUsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUM5QixNQUFNLFVBQVUsR0FBeUMsRUFBRSxDQUFDO0lBQzVELGlDQUFpQztJQUNqQyxNQUFNLGNBQWMsR0FBWSxFQUFFLENBQUM7SUFDbkMsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElB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