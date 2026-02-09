import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface PlatformConfig {
  id: string;
  name: string;
  configDir: string;
  skillDir: string;
}

const PLATFORMS: PlatformConfig[] = [
  // Tier 1 — major AI coding assistants
  {
    id: 'claude',
    name: 'Claude Code',
    configDir: '.claude',
    skillDir: '.claude/skills/bespoke-design',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    configDir: '.cursor',
    skillDir: '.cursor/skills/bespoke-design',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    configDir: '.windsurf',
    skillDir: '.windsurf/skills/bespoke-design',
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    configDir: '.github',
    skillDir: '.github/prompts/bespoke-design',
  },
  {
    id: 'codex',
    name: 'Codex',
    configDir: '.codex',
    skillDir: '.codex/skills/bespoke-design',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    configDir: '.gemini',
    skillDir: '.gemini/skills/bespoke-design',
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    configDir: '.agent',
    skillDir: '.agent/skills/bespoke-design',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    configDir: '.opencode',
    skillDir: '.opencode/skills/bespoke-design',
  },
  // Tier 2
  {
    id: 'kiro',
    name: 'Kiro',
    configDir: '.kiro',
    skillDir: '.kiro/steering/bespoke-design',
  },
  {
    id: 'roocode',
    name: 'RooCode',
    configDir: '.roo',
    skillDir: '.roo/skills/bespoke-design',
  },
  {
    id: 'qoder',
    name: 'Qoder',
    configDir: '.qoder',
    skillDir: '.qoder/skills/bespoke-design',
  },
  {
    id: 'trae',
    name: 'Trae',
    configDir: '.trae',
    skillDir: '.trae/skills/bespoke-design',
  },
  {
    id: 'continue',
    name: 'Continue',
    configDir: '.continue',
    skillDir: '.continue/skills/bespoke-design',
  },
  {
    id: 'codebuddy',
    name: 'CodeBuddy',
    configDir: '.codebuddy',
    skillDir: '.codebuddy/skills/bespoke-design',
  },
];

export function getPlatform(id: string): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export function getAllPlatforms(): PlatformConfig[] {
  return PLATFORMS;
}

export function detectPlatforms(cwd: string): PlatformConfig[] {
  return PLATFORMS.filter((p) => existsSync(join(cwd, p.configDir)));
}

export function isInstalled(cwd: string, platform: PlatformConfig): boolean {
  return existsSync(join(cwd, platform.skillDir, 'SKILL.md'));
}
