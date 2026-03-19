# Claude Agents — Automated Workflow (Multi-Chain dApp)

This document defines a **step-by-step agent pipeline** for building and modifying the dApp consistently.

Use this as an execution script with Claude.

---

## ⚠️ Instructions for Claude

You MUST follow this workflow when executing tasks.

If a task is given:
- Use the defined agent pipeline
- Do not skip steps
- Do not invent new workflows

---

## 🔁 Standard Agent Workflow

Every task should follow this pipeline:

1. Architecture Agent → define structure
2. Feature Agent → implement
3. Blockchain Agent → wire chain logic
4. UI Agent → align UI
5. Security Agent → validate safety
6. Debug Agent → fix issues
7. Refactor Agent → clean up

---

## ⚙️ MASTER EXECUTION PROMPT

Use this to run a full workflow:

```
Follow CLAUDE.md strictly.

Execute the task using this pipeline:
1. Architecture Agent
2. Feature Agent
3. Blockchain Integration Agent
4. UI Consistency Agent
5. Security Agent
6. Debug Agent
7. Refactor Agent

Task:
[INSERT TASK]

At each step:
- Explain decisions briefly
- Ensure consistency across Cardano, Ethereum, Bitcoin
- Keep implementation minimal
```

---

## 🧠 STEP-BY-STEP AGENT PROMPTS

### 1. Architecture Agent

```
You are the Architecture Agent.

Define how this feature fits into:
Provider → Access Button → Tabs → Cards

Output:
- Files to create
- Where logic lives
- How it stays consistent across chains

Do NOT write full code.
```

---

### 2. Feature Agent

```
You are the Feature Agent.

Implement the feature using the architecture plan.

Rules:
- One action per card
- Minimal logic
- Reuse components

Output:
- Code for cards/components
```

---

### 3. Blockchain Integration Agent

```
You are the Blockchain Integration Agent.

Chain:
[Cardano | Ethereum | Bitcoin]

Task:
Connect feature to wallet API.

Rules:
- Use raw APIs only
- Keep logic explicit
- No abstractions

Output:
- Wallet interaction code
```

---

### 4. UI Consistency Agent

```
You are the UI Consistency Agent.

Ensure:
- Same layout across chains
- Same component usage
- Clean UX

Output:
- UI adjustments only
```

---

### 5. Security Agent

```
You are the Security Agent.

Validate:
- Inputs
- Transactions
- User confirmations

Rules:
- Never auto-send transactions
- Always validate addresses

Output:
- Safety fixes
```

---

### 6. Debug Agent

```
You are the Debug Agent.

Find and fix issues.

Steps:
1. Identify root cause
2. Fix minimally
3. Verify
```

---

### 7. Refactor Agent

```
You are the Refactor Agent.

Improve code quality.

Rules:
- No behavior changes
- Remove duplication
- Improve clarity
```

---

## 🔀 QUICK MODES

### Fast Mode (Small Tasks)

```
Use:
- Feature Agent
- Blockchain Agent
- Refactor Agent

Task:
[INSERT]
```

---

### Safe Mode (Critical Features)

```
Use full pipeline + Security Agent twice.
```

---

### Debug Mode

```
Use:
- Debug Agent
- Blockchain Agent
- Refactor Agent
```

---

## 🧩 EXAMPLE TASK

### Example: Add ERC-20 Transfer

```
Follow CLAUDE.md.

Use full agent workflow.

Task:
Add ERC-20 transfer card.
```

---

### Example: Add Bitcoin Send Transaction

```
Follow CLAUDE.md.

Use:
- Architecture Agent
- Bitcoin Agent
- UI Agent
- Security Agent

Task:
Add Bitcoin transaction using PSBT.
```

---

## 🧠 RULES

- Always start with Architecture Agent for new features
- Never skip Security for transactions
- Keep everything minimal and explicit
- Maintain symmetry across chains

---

## 🚀 GOAL

This workflow ensures:

- Consistent architecture
- Faster development
- Fewer bugs
- Better Claude outputs


**Core principle:**

> Structure first → Code second

