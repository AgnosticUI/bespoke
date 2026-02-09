/**
 * Handlebars String Helpers
 * String manipulation and conditional helpers
 */

import type Handlebars from 'handlebars';

export function registerStringHelpers(hbs: typeof Handlebars): void {
  // "My String" → "my-string"
  hbs.registerHelper('kebab', (str: string) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  });

  // "my-string" → "myString"
  hbs.registerHelper('camel', (str: string) => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^[A-Z]/, (c) => c.toLowerCase());
  });

  // Wrap in single quotes
  hbs.registerHelper('quote', (str: string) => {
    return `'${str}'`;
  });

  // Block helper: {{#eq a b}}...{{/eq}}
  hbs.registerHelper('eq', function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  // Block helper: {{#neq a b}}...{{/neq}}
  hbs.registerHelper('neq', function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
    return a !== b ? options.fn(this) : options.inverse(this);
  });

  // ISO timestamp
  hbs.registerHelper('now', () => {
    return new Date().toISOString();
  });
}
