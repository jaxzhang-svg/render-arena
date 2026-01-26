#!/bin/bash

# Build script for Novita sandbox template

set -e

echo "🏗️  Building App Recording Service Sandbox Template..."

# Check if CLI is installed
if ! command -v novita-sandbox-cli &> /dev/null; then
    echo "❌ novita-sandbox-cli not found. Installing..."
    npm install -g @novitaai/sandbox-cli
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Build the template
echo "📦 Building sandbox template..."
novita-sandbox-cli template build -c "node ./scripts/server.js" --cpu-count 2 --memory-mb 2048

echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "1. Copy your template ID from the output above"
echo "2. Use the SDK to spawn sandboxes with the template ID"
echo ""
echo "Example usage:"
echo "```typescript"
echo "import { Sandbox } from 'novita-sandbox/code-interpreter'"
echo ""
echo "const sandbox = await Sandbox.create('your-template-id')"
echo "const host = sandbox.getHost(3000)"
echo "const baseUrl = \`https://\${host}\`"
echo ""
echo "// Record an app"
echo "await fetch(\`\${baseUrl}/record\", {"
echo "  method: 'POST',"
echo "  headers: { 'Content-Type': 'application/json' },"
echo "  body: JSON.stringify({ appId: 'your-app-id', duration: 10 })"
echo "})"
echo "```"
