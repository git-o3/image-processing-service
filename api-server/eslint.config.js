import importPlugin from "eslint-plugin-import";

export default [
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              // target.. prevent files ANYWHERE in the app from importing from an internal folder...
              target: "./src/modules/*/internal/**/*",
              // from ...if that import originates from a completely different module directory
              from: "./src/modules/*",
              // exception: buddy, allow a module to read its own internal folder
              except: ["./src/modules/${target.dir}/internal/**/*"],
              message: "Architectural Violation: Internal module folders are private. You must import from the module's root index.js entrypoint instead.",
            }
          ],
        },
      ],
    },
  },
];