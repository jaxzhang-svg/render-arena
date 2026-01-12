# AGENT.md - Novita Arena Implementation Context

**Last Updated**: 2025-01-12
**Session Context**: LLM code generation flow integration (Fragments clone)
**Build Status**: Passing
**Lint Status**: Passing
**Test Status**: Not yet tested with real API keys

---

## Quick Reference

### Key Commands
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

### Environment Variables Required
```bash
# .env.local
NOVITA_API_KEY=your-novita-api-key    # Required for LLM API
E2B_API_KEY=your-e2b-api-key          # Required for Sandbox (novita-sandbox)
```

### Key URLs
- **LLM API Base**: `https://api.novita.ai/openai/v1`
- **Playground**: `http://localhost:3000/playground`

---

## Current Implementation State

### Architecture Overview

```
User Input (Prompt)
       |
       v
+------------------+     +------------------+
|  Playground Page |---->|  /api/chat       |
|  (useObject)     |     |  (streamObject)  |
+------------------+     +------------------+
       |                        |
       |                        v
       |                 +------------------+
       |                 |  Novita LLM API  |
       |                 |  (OpenAI compat) |
       |                 +------------------+
       |                        |
       v                        v
+------------------+     +------------------+
|  Fragment Schema |<----|  Streaming JSON  |
|  (Zod validated) |     |  (code, title..) |
+------------------+     +------------------+
       |
       v
+------------------+     +------------------+
|  /api/sandbox    |---->|  novita-sandbox  |
|  (create sandbox)|     |  (E2B compat)    |
+------------------+     +------------------+
       |
       v
+------------------+
|  FragmentWeb     |
|  (iframe preview)|
+------------------+
```

### Files Created (Previous Session)

| File | Purpose |
|------|---------|
| `lib/schema.ts` | Zod schema for LLM structured output (FragmentSchema) |
| `lib/models.ts` | Model configuration (Minimax, GLM, DeepSeek) + client factory |
| `lib/templates.ts` | Next.js template config (dependencies, file paths) |
| `lib/prompt.ts` | System prompt for code generation |
| `lib/messages.ts` | Message types + conversion to AI SDK format |
| `lib/types.ts` | ExecutionResult types (Web, Interpreter) |
| `app/api/chat/route.ts` | LLM streaming API using Vercel AI SDK |
| `app/api/sandbox/route.ts` | Sandbox creation endpoint |
| `components/app/fragment-preview.tsx` | Preview wrapper component |
| `components/app/fragment-web.tsx` | iframe-based web preview |

### Files Modified (Previous Session)

| File | Changes |
|------|---------|
| `app/playground/page.tsx` | Integrated dual-model Arena mode with real LLM generation |

---

## Core Components

### 1. LLM Chat API (`app/api/chat/route.ts`)

**Endpoint**: `POST /api/chat`

**Request Body**:
```typescript
{
  messages: ModelMessage[],  // User conversation
  model: LLMModel           // Selected model config
}
```

**Response**: Text stream (Vercel AI SDK format)

**Key Implementation**:
```typescript
const stream = await streamObject({
  model: modelClient as LanguageModel,
  schema,                    // fragmentSchema from lib/schema.ts
  system: toPrompt(templates),
  messages,
  maxRetries: 0,
})
return stream.toTextStreamResponse()
```

### 2. Sandbox API (`app/api/sandbox/route.ts`)

**Endpoint**: `POST /api/sandbox`

**Request Body**:
```typescript
{
  fragment: FragmentSchema  // Generated code + metadata
}
```

**Response**:
```typescript
{
  sbxId: string,
  template: string,
  url: string              // Sandbox preview URL
}
```

### 3. Fragment Schema (`lib/schema.ts`)

```typescript
{
  commentary: string,              // LLM's plan/thinking
  template: string,                // Template name (e.g., "nextjs-developer")
  title: string,                   // App title (max 3 words)
  description: string,             // App description (1 sentence)
  additional_dependencies: string[], // Extra npm packages
  has_additional_dependencies: boolean,
  install_dependencies_command: string,
  port: number | null,             // Exposed port (3000 for Next.js)
  file_path: string,               // File to write (e.g., "pages/index.tsx")
  code: string                     // Generated code
}
```

### 4. Available Models (`lib/models.ts`)

| Model ID | Display Name | Color |
|----------|--------------|-------|
| `minimax/minimax-m2.1` | Minimax M2.1 | emerald |
| `zai-org/glm-4.7` | GLM 4.7 | blue |
| `deepseek/deepseek-v3.2` | DeepSeek V3.2 | purple |

### 5. Playground Page (`app/playground/page.tsx`)

**Key Features**:
- Dual-model Arena mode (A vs B)
- Model selection dropdowns
- Split view / fullscreen toggle
- Real-time step indicators
- Code download functionality
- Recording mode (video export)

**State Management**:
```typescript
// Model selection
const [selectedModelA, setSelectedModelA] = useState<LLMModel>(models[0])
const [selectedModelB, setSelectedModelB] = useState<LLMModel>(models[1])

// Generation results
const [resultA, setResultA] = useState<ExecutionResultWeb | undefined>()
const [resultB, setResultB] = useState<ExecutionResultWeb | undefined>()

// useObject hooks for streaming
const { object: objectA, submit: submitA, isLoading: isLoadingA } = useObject({...})
const { object: objectB, submit: submitB, isLoading: isLoadingB } = useObject({...})
```

---

## Known Issues & Debugging Notes

### Issue 1: API Chat Response Format (Potential)

**Symptom**: TBD - needs testing with real API key

**Potential Cause**: `toTextStreamResponse()` may not be compatible with `useObject` hook

**Investigation**:
1. Check if `.toDataStreamResponse()` should be used instead
2. Verify streaming format matches AI SDK expectations
3. Check browser console for parsing errors

### Issue 2: Model Client Type Cast

**Location**: `app/api/chat/route.ts:28`
```typescript
model: modelClient as LanguageModel
```

**Risk**: Type assertion may hide incompatibility issues

**Investigation**:
1. Verify `@ai-sdk/openai` returns proper LanguageModel
2. Check if Novita API is fully OpenAI-compatible for structured output

### Issue 3: Template ID Suffix in Dev Mode

**Location**: `lib/templates.ts`
```typescript
function getTemplateIdSuffix(id: string) {
  const isDev = process.env.NODE_ENV === 'development'
  return isDev ? `${id}-dev` : id
}
```

**Note**: Template ID becomes `nextjs-developer-dev` in development. Ensure sandbox supports this.

---

## Testing Checklist

### Pre-Testing Setup
- [ ] Set `NOVITA_API_KEY` in `.env.local`
- [ ] Set `E2B_API_KEY` in `.env.local`
- [ ] Verify dev server is running (`npm run dev`)

### API Testing
- [ ] Test `/api/chat` with curl/Postman
- [ ] Verify streaming response format
- [ ] Check error handling for invalid API key
- [ ] Test with all three models

### E2E Testing
- [ ] Generate app with single model
- [ ] Generate app with dual models (Arena mode)
- [ ] Verify sandbox preview loads
- [ ] Test code download
- [ ] Test view mode switching

### Error Scenarios
- [ ] Invalid prompt handling
- [ ] API timeout handling
- [ ] Sandbox creation failure
- [ ] Network error recovery

---

## Development Notes

### Vercel AI SDK Usage

**Package**: `ai` v6.0.27

**Key Functions**:
- `streamObject()` - Server-side streaming with schema validation
- `useObject()` - Client-side hook for consuming object streams

**Important**: Using `experimental_useObject` import:
```typescript
import { experimental_useObject as useObject } from '@ai-sdk/react'
```

### novita-sandbox Package

**Package**: `novita-sandbox` v1.0.1

**Usage**:
```typescript
import { Sandbox } from 'novita-sandbox'

const sbx = await Sandbox.create(templateId, {
  metadata: { template: templateId },
  timeoutMs: 10 * 60 * 1000  // 10 minutes
})

await sbx.commands.run(installCommand)
await sbx.files.write(filePath, code)
const url = `https://${sbx.getHost(port)}`
```

### Path Alias
All imports use `@/` prefix:
```typescript
import { something } from '@/lib/something'
```

---

## Next Steps

### Immediate (Debugging)
1. Test with real `NOVITA_API_KEY`
2. Capture and document any errors from `/api/chat`
3. Verify streaming format compatibility
4. Fix any identified issues

### Short-term (Enhancements)
1. Add proper error handling UI
2. Implement loading state animations
3. Add code syntax highlighting
4. Improve error messages for users

### Medium-term (Features)
1. Implement recording/video export
2. Add social sharing functionality
3. Build community gallery
4. Add user authentication

---

## Reference Links

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [E2B Fragments Project](https://github.com/e2b-dev/fragments)
- [Novita API Documentation](https://novita.ai/docs)
- [Project PRD](./docs/prd/README.md)
