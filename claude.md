# claude.md

## Project Overview

Electron + TypeScript desktop application.

- Adopt the dual package.json pattern recommended by electron-builder
    · The packages directory contains code that will be bundled.
    · The app directory is where native module dependencies should reside.


## Rules

- Reject ambiguous code, for example, use === instead of ==