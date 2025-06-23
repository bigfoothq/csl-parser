
# Covenant-Driven Development Guide

## Philosophy

Covenant-Driven Development (CDD) enables 100% LLM-generated codebases through frozen behavioral contracts.

**Core Principles:**

**Mortal Bonds**: Covenants are frozen specs. When requirements change, create new covenants and rewrite (never refactor) all dependent code. This prevents specification drift.  During initial development, however, documentation will be sequentially grown and modified. 

**One File, One Thought**: Each file is self-contained, sized for LLM context windows. Filesystem structure provides navigation—no cross-references needed.

**Test-Driven Structure**: Unit tests live with code, integration tests at boundaries. Tests generated from covenants become frozen truth.

**Hierarchical Visibility**: Dependencies flow downward. Core sees components, components see only shared. Siblings isolated. No circular dependencies.

**Single Source of Truth**: Each piece of information lives in exactly one place.

This enables LLMs to read, write, test, and maintain entire codebases through clear boundaries and immutable contracts.

## Filesystem Structure

```
myproject/
├── shared/                          # Zero-dependency foundation (types, utilities, constants)
│   ├── doc/
│   │   ├── ABSTRACT.md              # purpose (< 60 words) and overview (< 300 words)
│   │   ├── API.md                   # Public functions available
│   │   └── TYPES.md                 # Shared data structures
│   ├── src/
│   │   ├── validation.js
│   │   ├── formatting.js
│   │   ├── constants.js             # Project-wide constants
│   │   └── types.js                 # Type definitions/schemas
│   └── test-unit/
│       ├── cov/
│       │   ├── validation.cov.md    # Frozen behavior contracts
│       │   └── formatting.cov.md
│       └── test/
│           ├── validation.test.js   # Generated from covenants
│           └── formatting.test.js
└── main/
    ├── core/                        # Orchestration layer that uses components
    │   ├── doc/
    │   │   ├── ABSTRACT.md          # purpose (< 60 words) and overview (< 300 words)
    │   │   ├── STORY.md             # End-to-end user journeys
    │   │   ├── ARCH.md              # Component interactions
    │   │   ├── API.md               # External interfaces
    │   │   ├── TYPES.md             # Core data structures
    │   │   ├── concepts/            # Domain concepts
    │   │   │   └── authorization.md
    │   │   └── work/
    │   │       ├── background.md
    │   │       └── adr/ ...
    │   ├── src/
    │   │   ├── orchestrator.js      # Main coordination logic
    │   │   └── router.js
    │   └── test-unit/
    │       ├── cov/
    │       │   ├── orchestrator.cov.md
    │       │   └── router.cov.md
    │       └── test/
    │           ├── orchestrator.test.js
    │           └── router.test.js
    │
    ├── components/                  # Feature implementations, depend only on shared/
    │   ├── auth/                    # Example component
    │   │   ├── shared/              # Component-local utilities
    │   │   │   ├── doc/
    │   │   │   ├── src/
    │   │   │   └── test-unit/
    │   │   └── main/
    │   │       ├── core/
    │   │       │   ├── doc/
    │   │       │   │   ├── ABSTRACT.md
    │   │       │   │   ├── STORY.md
    │   │       │   │   ├── ARCH.md
    │   │       │   │   ├── API.md
    │   │       │   │   └── concepts/
    │   │       │   │       └── tokens.md
    │   │       │   ├── src/
    │   │       │   └── test-unit/
    │   │       ├── components/      # Nested subcomponents
    │   │       │   ├── jwt/
    │   │       │   └── oauth/
    │   │       └── test-intn/       # Auth integration tests
    │   │
    │   └── storage/                 # Another component
    │       └── main/ ...
    │
    └── test-intn/                   # System integration tests
        ├── cov/
        │   └── end-to-end.cov.md
        └── test/
            └── end-to-end.test.js
```

## Visibility Rules

The structure enforces natural visibility boundaries:

1. **Shared visibility**: 
   - `shared/` directories contain dependency-free utilities
   - Visible to all code at their level and below
   - Cannot depend on components
   
2. **Core visibility**:
   - `core/` orchestrates components and can import from them
   - `core/` documentation describes system architecture and component interactions
   - Components cannot see or import from `core/` (prevents circular dependencies)

3. **Component isolation**:
   - Components are isolated from siblings
   - Can only see their own content and `shared/`
   - Nested components inherit parent component context

4. **Test boundaries**:
   - `test-unit/` tests individual functions in isolation
   - `test-intn/` tests interactions between components
   - Tests live as close as possible to what they test

## Covenants

Covenants are behavioral contracts that specify function signatures and example input/output pairs. They define what code must do without prescribing how.

Example covenant:
```markdown
parseEdit(xmlNode) → {path: string, search: string, replace: string}
- parseEdit(<edit path="src/main.js"><search>foo</search><replace>bar</replace></edit>) → {path: "src/main.js", search: "foo", replace: "bar"}
- parseEdit(<edit path="test.py"><search>old</search><replace>new</replace></edit>) → {path: "test.py", search: "old", replace: "new"}
```

Covenants freeze behavior after implementation is complete. During development, refine them as needed.

## Types in CDD

Types emerge from implementation. Write code first, extract types after patterns appear.

### Workflow

1. Write covenant (behavior spec)
   ```markdown
   parseEdit extracts path, search, replace from XML node
   ```

2. Implement with minimal types
   ```typescript
   export function parseEdit(node: any) {
     return {
       path: node.getAttribute('path'),
       search: extractCDATA(node, 'search'),
       replace: extractCDATA(node, 'replace')
     }
   }
   ```

3. Add types as needed
   ```typescript
   type EditTask = {path: string, search: string, replace: string}
   export function parseEdit(node: any): EditTask { ... }
   ```

4. Extract shared types after duplication
   ```typescript
   // shared/doc/TYPES.md - only after multiple components need it
   type TaskBase = {globalIndex: number, blockIndex?: number}
   ```

### Rules

- Never write TYPES.md before implementation
- Use `any` liberally in first draft
- Extract types only when shared across components
- Keep implementation-specific types inline

### Exception
External protocol types (XML schemas, API contracts, error codes) defined upfront in `shared/doc/TYPES.md` before implementation.

## Development Workflow

### System Design Phase
1. Write `main/core/doc/ABSTRACT.md` - what system does
2. Write `main/core/doc/STORY.md` - key user journeys  
3. Sketch `main/core/doc/ARCH.md` - list components and their one-sentence responsibilities. No details, no how, just what. Example: "auth: validates user credentials"
4. If external API/protocol has immutable spec (like XML schema, REST endpoints, error codes), define those types in `shared/doc/TYPES.md`. Skip all internal types - they emerge during implementation.

### Component-First Implementation
1. Pick ONE component from ARCH.md
2. Write component ABSTRACT.md
3. Create covenant (3-5 examples)
4. Generate tests from covenant
5. Implement with `any` types
6. Extract to shared/ after duplication - when same function/type appears in 2+ components, move to shared/. Don't anticipate reuse.
7. Write integration tests when component interacts with others
8. Repeat for next component

### Documentation Debt
- Keep `main/core/doc/DEBT.md` listing gaps: missing component docs, unclear interfaces, temporary hacks
- Update during implementation when you skip documentation
- Review after each component to fill critical gaps
- Accept that docs grow iteratively - full documentation comes after working code

### Integration Phase
- Update ARCH.md with real patterns
- Add integration tests
- Extract shared types/utilities

Key: Design identifies components. Implementation reveals types.

## Common Pitfalls

### Over-Engineering Types
- **Wrong**: Modeling entire execution flow before any code exists
- **Right**: Define protocol boundaries, let implementation types emerge

### Premature Abstraction
- **Wrong**: Creating shared utilities speculatively
- **Right**: Extract to shared/ only after duplication in 2+ components

### Documentation Paralysis
- **Wrong**: Writing complete ARCH.md before building anything
- **Right**: Start with ABSTRACT.md, grow docs as system grows

### Circular Dependencies
- **Wrong**: Components importing from core/
- **Right**: Core imports components, components import only shared/

### Type Scope Confusion
- **Wrong**: Debating internal representations (`Element` vs `rawXml`) without implementation
- **Right**: Use `any`, refine types as implementation reveals needs

## Test Runner
- Use Node.js built-in test runner. Do not use Jest, Mocha, or other frameworks.

## Debugging process 

### mostly future concerns

so the workflow is we write the cov, then the test, then the code.  and the we run the tests and we'll probably get errors we have to sort through.  VERY IMPORTANT:  during this debugging process, DO NOT ALLOW EDITS ON THE TESTS THEMSELVES.  except under explicit manual human approval.  only stuff like getting things to like compile or import properly etc.  but any changes to business logic kinda stuff may ONLY happen to the implemented code file, not the test.  any automated pipeline must explicity block changes to the tests during this debugging process.
