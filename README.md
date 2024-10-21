## Usage

```bash
# env
corepack enable
corepack install

# start
pnpm dev

# build
pnpm build[:dev]
pnpm package:pack


# install
pnpm add [module] -filter renderer
pnpm add [module] -w

```

## Development

1. In most cases, `electron` does not need additional `polyfill`, the `.browserlistrc` file in `packages/renderer` is configured with browser compatibility, please configure it to the current `chromium` version of `electron`.

2. The `Logger` module is not universal, and other projects cannot use it directly. You need to add `runtime` code and inject window logic. Here, only the output method of the log is customized, and you can modify it according to your own needs.

3. NodeNative modules should be installed in the `/app` directory. Please refer to the [electron-builder documentation](https://www.electron.build/tutorials/two-package-structure)