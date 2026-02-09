import chalk from 'chalk';
import ora, { type Ora } from 'ora';

let spinner: Ora | null = null;

export function title(text: string) {
  console.log(chalk.bold.cyan(`\n${text}\n`));
}

export function info(text: string) {
  console.log(chalk.blue('ℹ'), text);
}

export function success(text: string) {
  console.log(chalk.green('✔'), text);
}

export function warn(text: string) {
  console.log(chalk.yellow('⚠'), text);
}

export function error(text: string) {
  console.log(chalk.red('✖'), text);
}

export function startSpinner(text: string): Ora {
  spinner = ora(text).start();
  return spinner;
}

export function succeedSpinner(text?: string) {
  spinner?.succeed(text);
  spinner = null;
}

export function failSpinner(text?: string) {
  spinner?.fail(text);
  spinner = null;
}
