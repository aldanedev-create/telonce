# @teloce/shared

> Shared internal utilities, helper functions, and TypeScript types for the Teloce ecosystem.

[![npm version](https://img.shields.io/npm/v/@teloce/shared.svg)](https://www.npmjs.com/package/@teloce/shared)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@teloce/shared` is a core utility package designed to support other packages in the Teloce monorepo, including:

* `@teloce/compiler`
* `@teloce/reactivity`
* `@teloce/runtime-core`
* `@teloce/runtime-dom`

It provides common helper functions, TypeScript types, constants, and utilities used across the Teloce ecosystem.

## Installation

### pnpm

```bash
pnpm add @teloce/shared
```

### npm

```bash
npm install @teloce/shared
```

## Features

### Type Definitions

Core TypeScript interfaces, types, and utility types shared across Teloce packages.

### Helper Utilities

Lightweight, tree-shakeable utility functions for:

* String manipulation
* AST processing
* Runtime checks
* Type checking
* Common framework operations

### Shared Constants

Framework-wide constants, configuration values, and error codes used consistently across Teloce packages.

## Usage

```typescript
import {
  // Shared utilities and types
} from '@teloce/shared';
```

The package is primarily intended for internal use by Teloce packages, but its exported utilities and types can also be consumed by external integrations when needed.

## Design Goals

* **Lightweight** — Minimal runtime overhead.
* **Reusable** — Shared across the Teloce ecosystem.
* **Tree-shakeable** — Unused utilities can be removed by modern bundlers.
* **Type-safe** — Written with TypeScript and designed for strong typing.
* **Dependency-free** — Avoid unnecessary runtime dependencies.

## License

MIT © Teloce Contributors
