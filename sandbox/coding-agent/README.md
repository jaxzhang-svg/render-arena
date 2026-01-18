# Coding Agent

FastAPI HTTP Server for Claude Agent SDK with Next.js + shadcn/ui development capabilities.

## Project Structure

```
sandbox/coding-agent/
├── pyproject.toml              # uv project configuration
├── uv.lock                    # dependency lock file
├── .env                        # Environment variables (create this)
├── src/
│   ├── main.py                 # FastAPI application
│   ├── agent/
│   │   ├── runner.py           # Claude Agent runner
│   │   ├── hooks.py            # Agent event hooks
│   │   └── prompts/
│   │       └── system_prompt.txt
│   ├── models/
│   │   └── events.py           # SSE event models
│   └── tools/
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
cd sandbox/coding-agent
uv sync
```

### 2. Configure Environment Variables

Create `.env` file:

```bash
ANTHROPIC_BASE_URL=https://api.novita.ai/anthropic
ANTHROPIC_AUTH_TOKEN=your-novita-api-key-here
ANTHROPIC_MODEL=moonshotai/kimi-k2-instruct
```

### 3. Run Development Server

```bash
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Server starts at: `http://localhost:8000`

## API Endpoints

### GET /

Returns API information:

```json
{
  "name": "Coding Agent",
  "version": "0.1.0",
  "endpoints": {
    "POST /generate": "Start code generation (returns success)",
    "GET /stream": "SSE stream of generation events",
    "GET /health": "Health check",
    "POST /deploy": "Deploy to Vercel"
  }
}
```

### GET /health

Health check endpoint:

```bash
http GET http://localhost:8000/health
```

```json
{
  "status": "ok",
  "model": "moonshotai/kimi-k2-instruct"
}
```

### POST /generate

Start code generation (returns immediately).

If a session is already running, returns success without creating new session.
Otherwise, creates a new session and starts generation in background.

**Request:**

```bash
http POST http://localhost:8000/generate \
    prompt="Add a hello world page" \
    workdir="/home/user/app"
```

**Response:**

```json
{
  "success": true
}
```

**Behavior:**
- Returns immediately
- Generation runs in background
- Only one active session at a time
- If generation is already in progress, returns success (no new session created)

### GET /stream

SSE stream for session events (single global session).

Replays all historical events (10ms delay each).
If session is running, continues streaming live events.
If session is completed, ends stream after replay.

**Request:**

```bash
http --stream GET http://localhost:8000/stream
```

**Response (SSE Stream):**

Events are streamed as Server-Sent Events (SSE):

```
data: {"type":"started","timestamp":1234567890.0,"data":{"model":"...","prompt":"..."}}
data: {"type":"text","timestamp":1234567891.0,"data":{"text":"..."}}
data: {"type":"tool_use","timestamp":1234567892.0,"data":{"name":"Read","input":{...}}}
data: {"type":"tool_result","timestamp":1234567893.0,"data":{"content":"..."}}
data: {"type":"completed","timestamp":1234567895.0,"data":{"success":true,"total_duration_ms":5000}}
```

**SSE Headers:**
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`
- `X-Accel-Buffering: no` (prevents nginx buffering)

**Event Replay:**
- Historical events replayed with 10ms delay between each
- If session is running, continues streaming live events after replay
- If session is completed/error, stream ends after replay

### POST /deploy

Deploy the generated app to Vercel.

Runs `vercel -t <VERCEL_TOKEN> deploy --prod --yes` in the working directory.
The deployment URL is captured from stdout (as per Vercel CLI documentation).
Requires `VERCEL_TOKEN` environment variable.

**Request:**

```bash
http POST http://localhost:8000/deploy
```

**Response:**

```json
{
  "vercelUrl": "https://your-app.vercel.app"
}
```

**Note**: Vercel CLI requires the token to be passed via `-t` flag, not from environment variable.

## Event Types

| Type | Description |
|-------|-------------|
| `started` | Agent started execution |
| `text` | Claude's text response to user |
| `thinking` | Claude's internal thinking (extended thinking) |
| `tool_use` | Tool being called (invocation request) |
| `tool_result` | Result of tool execution |
| `pre_tool_use` | Before tool execution (with input and timing) |
| `post_tool_use` | After tool execution (with output and duration) |
| `result` | Final execution metadata (cost, usage, turns) |
| `system` | System metadata |
| `error` | Error occurred |
| `completed` | Agent finished successfully |

## Development

### Type Checking

```bash
uv run pyright src/
```

### Linting

```bash
uv run ruff check src/
uv run ruff format src/
```

### Testing Endpoints

#### Health Check

```bash
http GET http://localhost:8000/health
```

#### Testing Code Generation Flow

**Step 1: Start generation**

```bash
http POST http://localhost:8000/generate \
    prompt="Create a hello world page" \
    workdir="/home/user/app"
```

Response:
```json
{"success": true}
```

**Step 2: Stream events**

```bash
http --stream GET http://localhost:8000/stream
```

Or with formatted JSON output:

```bash
http --stream GET http://localhost:8000/stream | \
    while IFS= read -r line; do
      echo "$line" | grep "^data:" | sed 's/^data: //' | jq -C 2>/dev/null || echo "$line"
    done
```

* Other prompts to test: "Create a 3D simulation of a formula 1 car performing a continuous drifting donut in the street"

**Step 3: Deploy to Vercel (after generation completes)**

```bash
http POST http://localhost:8000/deploy
```

#### Test in Docker

```bash
# Build from project root with sandbox context
docker build -f sandbox/novita.Dockerfile -t novita-sandbox:test sandbox/
```

```bash
# Run container
docker run --rm -d --name test-coding-agent -p 8000:8000 -p 3000:3000 \
    --env-file sandbox/coding-agent/.env \
    novita-sandbox:test
```

#### Build to sandbox

```bash
novita-sandbox-cli template build -n coding-agent-nextjs --cpu-count 2 --memory-mb 2048
```

## Architecture

- **FastAPI Server**: HTTP endpoints for health, code generation, streaming, and deployment
- **Claude Agent SDK**: Core AI agent with tool capabilities
- **Session Management**: Single active session with event storage and replay capability
- **SSE Streaming**: Real-time event streaming to frontend via Server-Sent Events
- **Event System**: Hook-based event capture for tool usage, file operations, and agent lifecycle
- **Background Tasks**: Async task execution for non-blocking generation
- **Vercel CLI**: Integrated deployment support

### Event Flow

1. **POST /generate**: Creates session (if not running), starts background task, returns success
2. **Background Task**: Runs Claude Agent with tools (Read/Write/Bash/Glob/Grep)
3. **PreToolUse Hook**: Captures tool start → stores to session events
4. **Tool Execution**: Agent runs tool
5. **PostToolUse Hook**: Captures tool result → stores to session events
6. **GET /stream**: Replays historical events (10ms delay) + streams live events if running
7. **Client**: Receives event replay + real-time events showing agent activity

### Session Lifecycle

- **Creating**: New session created when `/generate` called with no active session
- **Running**: Agent executing, events being stored
- **Completed**: Agent finished successfully, all events available for replay
- **Error**: Agent failed with error, error event added to session
- Only ONE session active at a time (防重入 - prevents concurrent sessions)

## Environment Variables

Required environment variables:

```bash
# Claude API Configuration
ANTHROPIC_BASE_URL=https://api.novita.ai/anthropic
ANTHROPIC_AUTH_TOKEN=your-novita-api-key-here
ANTHROPIC_MODEL=moonshotai/kimi-k2-instruct

# Vercel Deployment (optional, only needed for /deploy endpoint)
VERCEL_TOKEN=your-vercel-token-here
```

## Next Steps

1. Set `ANTHROPIC_AUTH_TOKEN` with valid Novita API key
2. Test the full flow: `/generate` → `/stream` → `/deploy`
3. Integrate with frontend for real-time event visualization
4. Configure Vercel project for deployment

## License

MIT
