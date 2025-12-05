import type {Config} from 'jest';


export default {
  preset:"ts-jest",
  testEnvironment: "node",
  testMatch:['**/tests/**/*.test.ts'],
  verbose:true,
  forceExit: true
} as Config