import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier/flat';
import svelte from 'eslint-plugin-svelte';
import storybook from 'eslint-plugin-storybook';

export default [
	{
		ignores: [
			'**/.DS_Store',
			'node_modules/**',
			'build/**',
			'.svelte-kit/**',
			'test-results/**',
			'storybook-static/**',
			'package/**',
			'.env.local',
			'.env.*',
			'pnpm-lock.yaml',
			'package-lock.json',
			'yarn.lock'
		]
	},
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	...svelte.configs['flat/prettier'],
	...storybook.configs['flat/recommended'],
	prettier,
	{
		files: ['**/*.{js,mjs,cjs,svelte}'],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.es2017,
				...globals.node
			}
		},
		rules: {
			'no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/no-unused-svelte-ignore': 'off',
			'svelte/prefer-svelte-reactivity': 'off',
			'svelte/prefer-writable-derived': 'off'
		}
	}
];
