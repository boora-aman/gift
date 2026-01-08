## How to generate the VS Code AI prompt

1. Ensure you're inside a Frappe site environment (e.g., `bench console` or a site-enabled Python interpreter where `frappe` is importable).
2. From the repository root, run:

```bash
python3 scripts/generate_vscode_prompt.py --output vscode_ai_prompt.md
```

3. The generated file `vscode_ai_prompt.md` will contain the full prompt including backend DocTypes and fields JSON.

If you can't run the script in this environment, the `vscode_ai_prompt.md` file contains a template and instructions for manual use.
