import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['off'],
      'no-unused-vars': ['off'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'error',
      'no-unreachable': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      'no-console': 'off',

      // react-leaflet

    /* kill the global `L` (UMD build or @types/leaflet) */
    "no-restricted-globals": ["error", {
      "name": "L",
      "message": "The global `L` object is the imperative Leaflet API – migrate to React-Leaflet."
    }],

    /* belt-and-suspenders: specific constructors */
    "no-restricted-properties": ["error",
          {
            object: "L",
            property: "map",
            message: "Replace L.map with <MapContainer>.",
          },
          {
            object: "L",
            property: "marker",
            message: "Replace L.marker with <Marker>.",
          },
          {
            object: "L",
            property: "tileLayer",
            message: "Replace L.tileLayer with <TileLayer>.",
          },
        ],
      },
    },
);
