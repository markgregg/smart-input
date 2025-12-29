export default {
  default: {
    require: ['tests/hooks/**/*.ts', 'tests/steps/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
  },
};