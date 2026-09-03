# Job Copilot Solari - Development Guide

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm (or npm/yarn)
- PostgreSQL 15+ (local or remote)
- Python 3.8+ (for sandbox scripts testing)

### Initial Setup

1. **Clone and navigate**
   ```bash
   cd job-copilot-solari
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database URL
   ```

4. **Initialize database**
   ```bash
   # Generate Prisma client
   pnpm -F lib-db prisma generate

   # Create and migrate database
   pnpm -F lib-db prisma migrate dev --name init
   ```

5. **Start development servers**
   ```bash
   pnpm dev
   ```

   This starts both:
   - Agent: `localhost:8081` (WebSocket for LiveKit)
   - Web: `localhost:3000` (Frontend)

---

## Project Breakdown

### `agent/` - Voice Agent Backend

**What it does**:
- Listens for incoming LiveKit connections
- Transcribes voice (Groq Whisper)
- Parses intent (OpenAI LLM)
- Orchestrates job discovery & resume tailoring
- Speaks responses back to user

**Key files**:
- `src/main.ts` - Entry point
- `src/agent-handler.ts` - LiveKit connection handler
- `src/intent/job-intent.ts` - Intent parsing logic
- `src/stt/whisper.ts` - STT integration
- `src/solari/*` - Scraping & sandbox orchestration
- `src/conversation/state.ts` - Session state

**Development**:
```bash
# Run in dev mode (watches for changes)
pnpm -F agent dev

# Build for production
pnpm -F agent build

# Run tests
pnpm -F agent test

# Type checking
pnpm -F agent type-check
```

### `web/` - Next.js Frontend

**What it does**:
- Provides voice UI (microphone, transcript, results)
- Connects to LiveKit WebRTC
- Displays job listings & resume downloads
- Serves API endpoints for token generation

**Key files**:
- `app/copilot/page.tsx` - Main voice interface
- `components/VoiceOrb.tsx` - Microphone UI
- `components/ResultsCard.tsx` - Job display
- `app/api/livekit-token/route.ts` - Token endpoint

**Development**:
```bash
# Run dev server (with hot reload)
pnpm -F web dev

# Build for production
pnpm -F web build

# Start production build
pnpm -F web start
```

### `lib-db/` - Database Client

**What it does**:
- Provides Prisma ORM client
- Defines data models
- Exports query helpers

**Key files**:
- `src/index.ts` - Prisma client + query functions
- `prisma/schema.prisma` - Database schema

**Models**:
- `UserProfile` - User data & settings
- `JobPosting` - Job listings with dedup hash
- `TailoredResume` - Generated resumes with ATS scores

**Development**:
```bash
# Create new migration
pnpm -F lib-db prisma migrate dev --name feature_name

# View database
pnpm -F lib-db prisma studio

# Generate Prisma client after schema changes
pnpm -F lib-db prisma generate
```

### `sandbox-scripts/` - Python Utilities

**What they do**:
- Run in isolated Solari sandboxes
- No dependencies on Node.js
- Read input JSON from stdin, write output JSON to stdout

**Scripts**:
- `filter_and_score.py` - Filter job listings & compute scores
- `render_resume.py` - Render DOCX + ATS scoring

**Development**:
```bash
# Test locally (without Solari)
python sandbox-scripts/filter_and_score.py < input.json

# You'll need to mock the input/output
```

---

## Common Tasks

### Add a New Environment Variable

1. Add to `.env.example`:
   ```bash
   NEW_VAR=your_value
   ```

2. Add to `.env` (your copy)

3. Use in code:
   ```typescript
   const value = process.env.NEW_VAR;
   ```

4. If in agent, use config:
   ```typescript
   import { config } from './config';
   // config.agent.port, etc.
   ```

### Add a New API Route (Web)

1. Create file: `web/app/api/my-endpoint/route.ts`

2. Implement:
   ```typescript
   import { NextRequest, NextResponse } from "next/server";

   export async function POST(request: NextRequest) {
     const data = await request.json();
     // Process...
     return NextResponse.json({ result: "ok" });
   }
   ```

3. Call from frontend: `fetch('/api/my-endpoint', { method: 'POST', body: JSON.stringify({...}) })`

### Add a New Database Query

1. Create query in `lib-db/src/index.ts`:
   ```typescript
   export const myQueries = {
     async findById(id: string) {
       return prisma.myModel.findUnique({ where: { id } });
     }
   };
   ```

2. Use in agent/web:
   ```typescript
   import { myQueries } from '@job-copilot/lib-db';
   const result = await myQueries.findById('123');
   ```

### Run Linting & Type Checking

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Fix linting issues
pnpm lint --fix
```

### Test Agent Locally

```bash
# Run tests
pnpm -F agent test

# Run tests once
pnpm -F agent test:run

# Run with coverage
pnpm -F agent test:run --coverage
```

---

## Debugging

### Enable Debug Logging
```bash
AGENT_LOG_LEVEL=debug pnpm -F agent dev
```

### View Database
```bash
pnpm -F lib-db prisma studio
# Opens http://localhost:5555 in browser
```

### Check Environment Variables
```bash
# In Node.js code
console.log(process.env);

# Or in shell
env | grep LIVEKIT
```

### Common Issues

**"Cannot find module '@job-copilot/lib-db'"**
- Make sure `lib-db` is built: `pnpm -F lib-db build`
- Check `tsconfig.json` paths

**"DATABASE_URL not found"**
- Create `.env` file from `.env.example`
- Add `DATABASE_URL=...`

**"Prisma client not found"**
- Run: `pnpm -F lib-db prisma generate`

**"Port 3000 already in use"**
- Kill existing process: `lsof -i :3000` then `kill -9 <PID>`
- Or use different port: `PORT=3001 pnpm -F web dev`

---

## File Structure Best Practices

### Agent Package
```
agent/src/
├── stt/           # Speech-to-text
├── intent/        # LLM intent parsing
├── conversation/  # Session state
├── resume/        # Resume tailoring
└── solari/        # Scraping & sandbox
```

Each module should:
- Export a main class or functions
- Have its own types/interfaces
- Include error handling & logging
- Be testable in isolation

### Web Package
```
web/app/
├── copilot/page.tsx       # Main page
├── api/                   # Route handlers
└── components/            # React components

web/lib/
└── utils.ts               # Shared utilities
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All env vars set correctly
- [ ] Database migrations run: `pnpm -F lib-db prisma migrate deploy`
- [ ] TypeScript builds cleanly: `pnpm build`
- [ ] Tests pass: `pnpm test:run`
- [ ] Linting passes: `pnpm lint`
- [ ] Environment variables reviewed for secrets
- [ ] API keys are not committed to git
- [ ] Agent package checks: `pnpm --filter agent-starter-node typecheck`
- [ ] CORS configured for web/agent communication

---

## Resources

- **LiveKit Docs**: https://docs.livekit.io/
- **Prisma Docs**: https://www.prisma.io/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Docs**: https://www.typescriptlang.org/
- **Solari Docs**: https://docs.solari.dev/ (if available)

---

**Questions?** Check the architecture doc or review the code comments!
