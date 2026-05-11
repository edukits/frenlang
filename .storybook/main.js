import { mergeConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

// https://github.com/storybookjs/storybook/issues/20562
/**
 * @param {import('vite').InlineConfig} config
 */
const workaroundSvelteDocgenPluginConflictWithUnpluginIcons = (config) => {
	if (!config.plugins) return config;

	const [_internalPlugins, ...userPlugins] = config.plugins;
	const docgenPlugin = userPlugins.find(
		(plugin) => plugin.name === 'storybook:svelte-docgen-plugin'
	);
	if (docgenPlugin) {
		const origTransform = docgenPlugin.transform;
		const newTransform = function (code, id, options) {
			if (id.startsWith('~icons/')) {
				return;
			}
			return origTransform?.call(this, code, id, options);
		};
		docgenPlugin.transform = newTransform;
		docgenPlugin.enforce = 'post';
	}
	return config;
};

/** @type { import('@storybook/sveltekit').StorybookConfig } */
const config = {
	stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)'],
	addons: ['@chromatic-com/storybook', '@storybook/addon-svelte-csf'],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	docs: {
		autodocs: 'tag'
	},
	async viteFinal(config) {
		config = workaroundSvelteDocgenPluginConflictWithUnpluginIcons(config);

		// Merge custom configuration into the default config
		return mergeConfig(config, {
			plugins: [
				Icons({
					compiler: 'svelte'
				})
			]
		});
	}
};
export default config;
