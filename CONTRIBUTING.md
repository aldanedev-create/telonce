# Contributing to Teloce

First off, thank you for considering contributing to Teloce!

## Development Setup

### Prerequisites

* Node.js 20+
* pnpm 9+
* Git

### Clone and Install

```bash
git clone https://github.com/telocejs/teloce.git
cd teloce
pnpm install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Implement your changes and update the documentation when necessary.

### 3. Run Tests

```bash
pnpm test
```

### 4. Format and Lint

Teloce uses **Biome** for formatting and linting.

```bash
pnpm format
pnpm lint
```

### 5. Commit Your Changes

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
```

### 6. Push and Create a Pull Request

Push your feature branch and open a Pull Request against the main branch.

## Commit Convention

We use **Conventional Commits**:

| Type       | Description              |
| ---------- | ------------------------ |
| `feat`     | New feature              |
| `fix`      | Bug fix                  |
| `docs`     | Documentation changes    |
| `style`    | Code style changes       |
| `refactor` | Code refactoring         |
| `perf`     | Performance improvements |
| `test`     | Adding or updating tests |
| `chore`    | Maintenance changes      |

### Examples

```text
feat: add signals-based reactivity
fix: resolve compiler parsing issue
docs: update getting started guide
test: add compiler tests
refactor: simplify runtime implementation
```

## Pull Request Process

Before submitting a Pull Request:

* Update documentation when necessary.
* Add tests for new features and bug fixes.
* Ensure all tests pass.
* Run formatting and linting.
* Use a clear and descriptive PR title.
* Explain what your changes do and why.
* Request review from maintainers.

## Code Style

Teloce uses **Biome** for linting and formatting.

Run formatting:

```bash
pnpm format
```

Run linting:

```bash
pnpm lint
```

Please keep code consistent with the existing project style.

## License

By contributing to Teloce, you agree that your contributions will be licensed under the **MIT License**.
