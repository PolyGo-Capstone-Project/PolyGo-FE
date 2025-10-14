import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      "next",
      "next/core-web-vitals",
      "next/typescript",
      "plugin:jsx-a11y/recommended",
      "plugin:@tanstack/query/recommended",
      "prettier",
    ],
    plugins: ["jsx-a11y", "@tanstack/query"],
    rules: {
      //tanstack query
      "@tanstack/query/exhaustive-deps": "error",
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "off",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/exhaustive-deps": "warn",

      // Import rules - set to off for build, can enable for dev
      "import/order": "off",

      // General ESLint rules (không có prefix @typescript-eslint)
      "prefer-const": "warn",
      "no-console": "off", // Disable for build, clean up later

      // Next.js specific
      "@next/next/no-img-element": "warn",

      // Accessibility - reduce strictness for build
      "jsx-a11y/anchor-has-content": "off",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
    },
  }),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
