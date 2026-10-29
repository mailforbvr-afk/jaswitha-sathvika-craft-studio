import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", ".open-next/**", ".worker-next/**"] },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  // Existing components intentionally reset local state after prop changes.
  // Keep that established behavior while the project is upgraded to Next 16.
  { rules: { "react-hooks/set-state-in-effect": "off" } },
];

export default eslintConfig;
