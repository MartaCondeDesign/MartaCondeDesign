# Markdown for AI — Slide Deck

Source material for a carousel post. One idea per slide, following the
deck's own advice: short sections, explicit language, proper code fences.

---

## Slide 1 — Title

**The Dos and Don'ts of Markdown Files**

How to write `CLAUDE.md`, `DESIGN.md`, and every `.md` file your AI
actually reads.

---

## Slide 2 — Why this matters

**Markdown is becoming AI's native format**

`CLAUDE.md` is the first file Claude Code reads when it starts working
on your project. `DESIGN.md` carries your design system for AI. Both
are markdown. How you write them decides how well AI understands them.

---

## Slide 3 — Section marker

# ✅ DO

8 habits that make markdown legible to humans and AI alike.

---

## Slide 4 — Do 1: Use clear heading hierarchy

Structure content logically so files are scannable for both humans and
AI tools.

```
# Main Title
## Section
### Subsection
```

---

## Slide 5 — Do 2: Prioritize important information

Put the instructions you most need followed at the top of the file.

```
# Core Rules

- Never modify production database directly
- Always write tests first
- Ask before deleting files
- Prefer TypeScript over JavaScript
```

---

## Slide 6 — Do 3: Keep sections short

Neither humans nor AI like large blocks of text. Break walls of text
into small chunks.

Instead of one massive paragraph, use:

```
## Problem statement
Short explanation.

## Solution
Short explanation.
```

---

## Slide 7 — Do 4: Use explicit instructions

Vague language works equally poorly for humans and AI. Replace general
statements with specific, checkable rules — and avoid instruction
collisions like "Move fast" next to "Run in-depth code analysis."

```
- Use ESLint + Prettier defaults
- Avoid files over 300 lines
```

---

## Slide 8 — Do 5: Use lists generously

Bullets are fast to scan, easy to edit, and AI-friendly. Use numbered
lists for processes.

```
## How to test the product
1. Download configuration
2. Install dependencies
3. Run the project
```

---

## Slide 9 — Do 6: Use code fences properly

Always specify the language for syntax highlighting. It helps
developers, AI systems, and documentation tooling alike.

````
```ts
const hello = "world"
```
````

---

## Slide 10 — Do 7: Keep line length reasonable

Very long lines are hard to review in Git.

- ~80–120 characters per line for prose
- Shorter for lists and tables

---

## Slide 11 — Do 8: Optimize for Git diffs

Make it easy for humans and AI to see what changed between versions:
one sentence per line, clear whitespace between list items.

---

## Slide 12 — Section marker

# ❌ DON'T

8 habits that quietly break markdown for humans and AI.

---

## Slide 13 — Don't 1: Write long philosophical explanations

Keep long philosophical explanations for leadership decks. They don't
mean much to AI — or to most humans.

```
We believe software craftsmanship is important because...
```

---

## Slide 14 — Don't 2: Include dead rules

Outdated rules are extremely dangerous — an AI will follow them as if
they were still true.

Avoid leaving in:
- Deprecated workflows
- Old architecture
- Obsolete stack decisions

---

## Slide 15 — Don't 3: Over-constrain the agent

Too many rigid instructions reduce adaptability.

```
Always use exactly 3 functions per file
```

---

## Slide 16 — Don't 4: Overuse emojis

A few can help orientation. Too many reduce professionalism.

```
🚀🔥💡⚡🎯❌✅🧠
```

---

## Slide 17 — Don't 5: Abuse bold formatting

Bold highlights important details — but not large blocks of text. If
everything is emphasized, nothing stands out.

---

## Slide 18 — Don't 6: Nest lists excessively

Deep nesting becomes unreadable fast. Keep hierarchy shallow.

```
* Item
   * Subitem
      * Subsubitem
         * Too deep
```

---

## Slide 19 — Don't 7: Mix multiple writing styles

Avoid combining formal documentation, casual notes, marketing copy, and
technical specs inside the same file without structure.

---

## Slide 20 — Don't 8: Put important information only in images

Markdown should remain searchable and accessible.

Instead of a bare heading, pair it with real text:

```
Architecture design
Description here.
```

---

## Slide 21 — Closing

**Write markdown like you're briefing a very literal new hire.**

Clear hierarchy. Short sections. Explicit rules. No dead weight.
That's the whole system — for `CLAUDE.md`, `DESIGN.md`, or any file
your AI will read first.

— Marta Conde, Design Systems Consultant
