/**
 * Template Helpers — Registry
 * Creates a configured Handlebars instance with all helpers registered
 */

import Handlebars from 'handlebars';
import { registerColorHelpers } from './color-helpers.js';
import { registerSpacingHelpers } from './spacing-helpers.js';
import { registerStringHelpers } from './string-helpers.js';

export function createHandlebars(): typeof Handlebars {
  const hbs = Handlebars.create();
  registerColorHelpers(hbs);
  registerSpacingHelpers(hbs);
  registerStringHelpers(hbs);
  return hbs;
}
