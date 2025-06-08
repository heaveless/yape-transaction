import { Config } from "jest";
import { compilerOptions } from "./tsconfig.json"

const fromPairs = (pairs: [string, string][]) =>
    pairs.reduce((res, [key, value]) => ({ ...res, [key]: value }), {});

const genModuleNameMapper = (paths: Record<string, string[]>) =>
    fromPairs(
        Object.entries(paths).map(([k, [v]]) => [
            `^${k.replace(/\*/, "(.*)")}`,
            `<rootDir>/${v.replace(/\*/, "$1")}`,
        ])
    );

const config: Config = {
    testResultsProcessor: 'jest-sonar-reporter',
    collectCoverage: true,
    coverageDirectory: './coverage/',
    coverageReporters: ['text', 'text-summary', 'lcov'],
    collectCoverageFrom: ['./src/**'],
    coverageThreshold: {
        global: {
            statements: 60,
            branches: 60,
            functions: 60,
            lines: 60,
        },
    },
    moduleFileExtensions: ["json", "js", "ts"],
    moduleNameMapper: genModuleNameMapper(compilerOptions.paths),
    testMatch: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
    transform: {
        "^.+\\.(t|j)s$": "ts-jest",
    },
    testEnvironment: "node",
    silent: false,
    verbose: true,
}

export default config
