import type { Preview } from '@storybook/react-vite'
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    /**
     * Registered here rather than on a single story, so any story can ask for a
     * layout by name. `wide` sits above --breakpoint-stack (768px) and `narrow`
     * below it: components that change shape at that line need to be pinned to
     * a side, or the test is really testing how wide the reader's pane happens
     * to be.
     */
    viewport: {
      options: {
        narrow: { name: 'Narrow (stacked)', styles: { width: '390px', height: '844px' } },
        wide: { name: 'Wide (table)', styles: { width: '1280px', height: '900px' } },
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
