import type { StorybookConfig } from '@storybook/react-vite';

import { dirname } from "path"

import { fileURLToPath } from "url"

/**
* This function is used to resolve the absolute path of a package.
* It is needed in projects that use Yarn PnP or are set up within a monorepo.
*/
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-mcp')
  ],
  "framework": getAbsolutePath('@storybook/react-vite'),

  /**
   * Two guards against the same failure: "Invalid hook call — you might have
   * more than one copy of React".
   *
   * `dedupe` forces every import of React to resolve to the one copy hoisted at
   * the workspace root, rather than to a second copy reached through a package
   * link. `optimizeDeps.include` pre-bundles React up front, so adding the
   * first story that uses a hook cannot trigger a mid-session re-optimise —
   * which leaves the already-loaded page holding one React and the newly
   * bundled module holding another.
   */
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    resolve: {
      ...viteConfig.resolve,
      dedupe: [...(viteConfig.resolve?.dedupe ?? []), 'react', 'react-dom'],
    },
    optimizeDeps: {
      ...viteConfig.optimizeDeps,
      include: [...(viteConfig.optimizeDeps?.include ?? []), 'react', 'react-dom', 'react/jsx-runtime'],
    },
  }),
};
export default config;
