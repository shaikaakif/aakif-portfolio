# Slash Command & Change-Scope Policy

## Slash Commands

- `/quickfix`: Make the smallest complete change possible. No unrelated edits, redesigns, refactors, dependency changes, or file restructuring.
- `/plan`: Analyze and propose a plan only. Do not modify files.
- `/code`: Implement only the requested scope.
- `/detail`: Plan complex work, identify affected files and risks, implement in stages, and verify each stage.
- `/debug`: Investigate before changing code. Explain the root cause and make a targeted fix.
- `/design`: Preserve the existing design system and unrelated UI.
- `/refactor`: Preserve observable behavior and functionality.
- `/test`: Run relevant checks and report actual results.
- `/review`: Report findings without editing files.
- `/ship`: Review, test, and prepare changes for Git. Never push or deploy without explicit authorization.

## Universal Rules

1. Read the project's engineering SOP before editing.
2. Inspect the current implementation and Git diff.
3. Preserve existing working features, architecture, design tokens, and user interactions.
4. Do not claim tests passed unless they were actually run.
5. If the request is ambiguous or requires broad modifications, explain the scope and ask before proceeding.
6. Prefer the smallest complete patch over rewriting existing components.
