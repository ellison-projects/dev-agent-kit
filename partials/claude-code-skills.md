## Claude Code Skills

When creating or modifying Claude Code skills in this repository, always review the latest skills documentation at: **https://code.claude.com/docs/en/skills**

Key conventions:

- Skills use YAML frontmatter in `SKILL.md` (NOT a separate `skill.json`)
- The `description` field is critical for auto-triggering
- Use `context: fork` to run skills in isolated subagent context
- See `.claude/skills/CLAUDE.md` in the Dev-Agent repo for detailed guidelines
