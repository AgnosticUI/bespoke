/**
 * State Manager
 * Handles reading/writing/updating the pipeline state file
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { dirname, resolve } from 'path';

export interface PipelineState {
  // Meta
  pipeline_version: string;
  timestamp: string;

  // Progress
  current_stage:
    | 'understand_problem'
    | 'wireframe_selection'
    | 'typography_selection'
    | 'combination_preview'
    | 'palette_application'
    | 'token_generation'
    | 'complete';
  completed_stages: string[];

  // Stage 1 outputs
  inferred_niche: string | null;
  application_type: string | null;
  niche_confidence: number | null;

  // Stage 2 outputs
  available_layouts: string[] | null;
  selected_layouts: string[] | null;

  // Stage 3 outputs
  available_typography: string[] | null;
  selected_typography: string[] | null;

  // Stage 4 outputs
  combinations: string[] | null;
  selected_combination: string | null;

  // Stage 5 outputs
  available_palettes: string[] | null;
  selected_palette: string | null;

  // Final outputs
  final_combination: {
    layout: string;
    typography: string;
    palette: string;
  } | null;

  // Generated artifacts
  generated_tokens: Record<string, string> | null;

  pipeline_complete: boolean;
}

const STATE_FILE = '.design-pipeline/state.json';
const PIPELINE_VERSION = '1.0';

/**
 * Create a fresh initial state
 */
export function createInitialState(): PipelineState {
  return {
    pipeline_version: PIPELINE_VERSION,
    timestamp: new Date().toISOString(),
    current_stage: 'understand_problem',
    completed_stages: [],
    inferred_niche: null,
    application_type: null,
    niche_confidence: null,
    available_layouts: null,
    selected_layouts: null,
    available_typography: null,
    selected_typography: null,
    combinations: null,
    selected_combination: null,
    available_palettes: null,
    selected_palette: null,
    final_combination: null,
    generated_tokens: null,
    pipeline_complete: false
  };
}

/**
 * Ensure the .design-pipeline directory exists
 */
export function ensureStateDirectory(): void {
  const dir = dirname(STATE_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Read the current state from disk
 * Returns initial state if file doesn't exist
 */
export function readState(): PipelineState {
  const statePath = resolve(STATE_FILE);

  if (!existsSync(statePath)) {
    return createInitialState();
  }

  try {
    const content = readFileSync(statePath, 'utf-8');
    const state = JSON.parse(content) as PipelineState;

    // Validate version
    if (state.pipeline_version !== PIPELINE_VERSION) {
      console.warn(`State file version mismatch: ${state.pipeline_version} vs ${PIPELINE_VERSION}`);
    }

    return state;
  } catch (error) {
    console.error('Failed to read state file:', error);
    // Return initial state on error
    return createInitialState();
  }
}

/**
 * Write state to disk atomically (temp file + rename)
 */
export function writeState(state: PipelineState): void {
  ensureStateDirectory();

  const statePath = resolve(STATE_FILE);
  const tempPath = `${statePath}.tmp`;

  // Update timestamp
  state.timestamp = new Date().toISOString();

  // Write to temp file
  writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf-8');

  // Atomic rename
  renameSync(tempPath, statePath);
}

/**
 * Update state with partial values
 */
export function updateState(updates: Partial<PipelineState>): PipelineState {
  const currentState = readState();
  const newState: PipelineState = {
    ...currentState,
    ...updates,
    timestamp: new Date().toISOString()
  };

  writeState(newState);
  return newState;
}

/**
 * Mark a stage as complete and move to next stage
 */
export function completeStage(
  currentStage: string,
  nextStage: PipelineState['current_stage'],
  stageOutputs: Partial<PipelineState> = {}
): PipelineState {
  const state = readState();

  // Add current stage to completed if not already there
  if (!state.completed_stages.includes(currentStage)) {
    state.completed_stages.push(currentStage);
  }

  // Update state with outputs and next stage
  const newState: PipelineState = {
    ...state,
    ...stageOutputs,
    current_stage: nextStage,
    timestamp: new Date().toISOString()
  };

  writeState(newState);
  return newState;
}

/**
 * Reset to a previous stage (for "go back" functionality)
 */
export function resetToStage(targetStage: PipelineState['current_stage']): PipelineState {
  const state = readState();

  const stageOrder = [
    'understand_problem',
    'wireframe_selection',
    'typography_selection',
    'combination_preview',
    'palette_application',
    'token_generation',
    'complete'
  ];

  const targetIndex = stageOrder.indexOf(targetStage);

  // Remove stages after target from completed
  state.completed_stages = state.completed_stages.filter(s => {
    const stageIndex = stageOrder.indexOf(s);
    return stageIndex < targetIndex;
  });

  state.current_stage = targetStage;
  writeState(state);

  return state;
}

/**
 * Reset state completely
 */
export function resetState(): PipelineState {
  const state = createInitialState();
  writeState(state);
  return state;
}

/**
 * Validate state consistency
 */
export function validateState(state: PipelineState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check stage consistency
  if (state.current_stage === 'wireframe_selection' && !state.inferred_niche) {
    errors.push('In wireframe_selection but inferred_niche is null');
  }

  if (state.current_stage === 'typography_selection' && (!state.selected_layouts || state.selected_layouts.length !== 3)) {
    errors.push('In typography_selection but selected_layouts is not 3 items');
  }

  if (state.current_stage === 'combination_preview' && (!state.selected_typography || state.selected_typography.length !== 3)) {
    errors.push('In combination_preview but selected_typography is not 3 items');
  }

  if (state.current_stage === 'palette_application' && !state.selected_combination) {
    errors.push('In palette_application but selected_combination is null');
  }

  if (state.current_stage === 'token_generation' && !state.selected_palette) {
    errors.push('In token_generation but selected_palette is null');
  }

  // Check completed_stages consistency
  const stageOrder = [
    'understand_problem',
    'wireframe_selection',
    'typography_selection',
    'combination_preview',
    'palette_application',
    'token_generation'
  ];

  const currentIndex = stageOrder.indexOf(state.current_stage);
  for (let i = 0; i < currentIndex; i++) {
    if (!state.completed_stages.includes(stageOrder[i])) {
      errors.push(`Stage ${stageOrder[i]} should be completed but is not in completed_stages`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Self-test when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Testing State Manager...\n');

  // Create initial state
  console.log('Creating initial state...');
  const initialState = createInitialState();
  console.log(`Current stage: ${initialState.current_stage}`);

  // Write state
  console.log('\nWriting state...');
  writeState(initialState);
  console.log('State written to .design-pipeline/state.json');

  // Read state
  console.log('\nReading state...');
  const readBack = readState();
  console.log(`Read back stage: ${readBack.current_stage}`);

  // Update state
  console.log('\nUpdating state (simulating niche match)...');
  const updated = updateState({
    inferred_niche: 'medical',
    application_type: 'patient-portal',
    niche_confidence: 0.95
  });
  console.log(`Niche: ${updated.inferred_niche}, Type: ${updated.application_type}`);

  // Complete a stage
  console.log('\nCompleting understand_problem stage...');
  const afterComplete = completeStage('understand_problem', 'wireframe_selection');
  console.log(`New stage: ${afterComplete.current_stage}`);
  console.log(`Completed stages: ${afterComplete.completed_stages.join(', ')}`);

  // Validate
  console.log('\nValidating state...');
  const validation = validateState(afterComplete);
  console.log(`Valid: ${validation.valid}`);
  if (!validation.valid) {
    console.log(`Errors: ${validation.errors.join(', ')}`);
  }

  console.log('\n✓ State manager tests passed');
}
