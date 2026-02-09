import { Command } from 'commander';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('bespokeui')
  .description('Install the Bespoke Design System skill into AI coding assistants')
  .version('1.0.0');

program
  .command('init')
  .description('Install the Bespoke Design System skill into the current project')
  .option('--ai <platforms>', 'Target platform(s): claude, cursor, windsurf, copilot, codex, gemini, antigravity, opencode, kiro, roocode, qoder, trae, continue, codebuddy, all')
  .option('--force', 'Overwrite existing installation')
  .action(initCommand);

program.parse();
