import type { LogStack, LogLevel, LogPackage } from "./Types";
export declare const Log: (stack: LogStack, level: LogLevel, pkg: LogPackage, // Here, we use "pkg" instead of "package", because "package" is a reserved keyword, so we avoid any such errors.
message: string) => Promise<void>;
//# sourceMappingURL=Logging.d.ts.map