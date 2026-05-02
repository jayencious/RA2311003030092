
export type LogStack = "backend" | "frontend";
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

type SharedPackage = "auth" | "config" | "middleware" | "utils";
type BackendPackage = "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service";
type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";

export type LogPackage = SharedPackage | BackendPackage | FrontendPackage;