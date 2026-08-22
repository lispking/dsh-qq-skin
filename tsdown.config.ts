import { defineConfig } from 'tsdown'

/** Plugin id used by the client closure-factory loader registration. */
const PLUGIN_ID = 'dsh-qq-skin'

/**
 * Two-face build mirroring the harness client preset (`clientBundle`):
 * - Host half: plain ESM node library (`lib/index.js`), gives the Loader a
 *   host-side row for the cordis entry.
 * - Client half: browser CJS bundle wrapped in the `window.__ModuleLoader__`
 *   closure-factory format (`lib/client.js`) the web boot consumes. The skin
 *   carries no build-time CSS pipeline — its layout styles ship as an inline
 *   string inside the bundle (`QQ_LAYOUT_CSS`) and are injected at runtime,
 *   while every color contribution goes through the `--dsw-*` token layer.
 */
export default [
  defineConfig({
    name: `${PLUGIN_ID}/host`,
    entry: { index: 'lib/types/index.js' },
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
  }),
  defineConfig({
    name: `${PLUGIN_ID}/client`,
    entry: { client: 'lib/types/client/index.js' },
    outDir: 'lib',
    format: ['cjs'],
    platform: 'browser',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
    sourcemap: true,
    outputOptions: {
      entryFileNames: 'client.js',
      // Closure-factory contract from packages/client/tsdown.client.ts: the
      // bundle registers its factory with the module loader instead of
      // executing module bodies; externals resolve through the injected
      // require. The skin has no runtime imports, so the factory body is
      // self-contained.
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  }),
]
