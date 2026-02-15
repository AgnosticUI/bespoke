---
name: fix-github-issue
description: Fix a GitHub issue by number. Use when asked to fix GitHub issues.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(gh issue view *), Bash(gh pr view *), Bash(git status), Bash(git diff *), Bash(git log *), Bash(git branch *), Bash(git checkout *)
---

**Usage:** `/fix-github-issue ISSUE_NUMBER`

**Example:** `/fix-github-issue 276`

Fix GitHub issue $ARGUMENTS following best practices.

**Steps:**

1. **Verify we're starting from a clean state:**
   - Check `git status` to ensure working directory is clean
   - Confirm we're on `master` branch
   - If not clean or on wrong branch, STOP and ask user to resolve

2. **Create a feature branch:**
   - Use `git checkout -b issue-$ARGUMENTS/[short-description]`
   - Example: `issue-276/fix-button-variant`
   - **WAIT FOR USER APPROVAL of branch name**

3. **Analyze the issue:**
   - Use `gh issue view $ARGUMENTS` to fetch full issue details
   - Understand the problem, reproduction steps, and expected behavior
   - If there's anything in the issue that's not 100% clear **ASK USER for clarification before making any changes**

4. **Investigate the codebase:**
   - Use the following context to identify relevant locations:
     - Core SKILL.md with the bespoke_design_system pipeline functionality: `skills/bespoke_design_system/SKILL.md`
     - CSV based core data files: `skills/bespoke_design_system/data/`
     - layouts: `skills/bespoke_design_system/layouts/`
     - scripts: `skills/bespoke_design_system/scripts/`
     - templates: `skills/bespoke_design_system/templates/`
     - PRD: `skills/bespoke_design_system/docs/BESPOKE_DESIGN_SYSTEM_DOCUMENTATION.md`
   - Use Read, Grep, and Glob to find relevant files
   - Review current implementation and identify root cause

5. **Propose the fix:**
   - Explain what needs to change and why
   - Show the user your proposed changes
   - **WAIT FOR USER APPROVAL before making any changes**

6. **Implement only after approval:**
   - Make the necessary code changes
   - Update related files if needed
   - Verify the fix addresses the issue

7. **Prepare commit:**
   - Stage changes with `git add`
   - Create descriptive commit message: "Fix #$ARGUMENTS: [description]"
   - Show the user what will be committed
   - **WAIT FOR USER APPROVAL before committing**

8. **Inform user about next steps:**
   - Remind user they're on branch `issue-$ARGUMENTS/...`
   - Explain they should review changes with `git diff master`
   - When ready, they can: `git push -u origin issue-$ARGUMENTS/...`
   - Then create PR with: `gh pr create --base master --head issue-$ARGUMENTS/...`

**Important Rules:**

- **ALWAYS create a feature branch - NEVER work directly on master**
- **NEVER push to remote without explicit user permission**
- **ALWAYS show proposed changes before implementing**
- **STOP and ask for approval at each major step**
- Use clear, descriptive commit messages that reference the issue
