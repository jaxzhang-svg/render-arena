> ## Documentation Index
>
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Your First Agent Sandbox

## Create an Account

If you don't have a Novita account, you need to <Link href="https://novita.ai/user/register" target="_blank">sign up</Link> first. For details, please refer to <Link href="/guides/quickstart">Quickstart guide</Link>.

## Create API Key

Go to the Novita <Link href="https://novita.ai/settings/key-management" target="_blank">Key Management page</Link>, you can create an API key and save the API key value for use in subsequent steps.

## Install SDK

You can install the SDK by executing the following commands.

<CodeGroup isTerminalCommand>
  ```bash JavaScript & TypeScript SDK icon="terminal" theme={"system"}
  npm i novita-sandbox
  ```

```bash Python SDK icon="terminal" theme={"system"}
pip install novita-sandbox
```

</CodeGroup>

## Configure Environment Variables

Create a `.env` file in your project folder (if it doesn't exist), and configure the API key and API domain address.

<Warning>
  For JavaScript and TypeScript projects, you need to import the `dotenv/config` package in your project; for Python projects, you need to import the `dotenv` library in your project and call the `load_dotenv` method to load environment variables.
  For details, please refer to the [example](#use-sdk-to-start-agent-sandbox).
</Warning>

```bash .env icon="terminal" highlight={2} theme={"system"}
NOVITA_API_KEY=sk_*** # Novita API key obtained from previous steps
```

Or you can configure the API key and API domain address by setting environment variables in your terminal.

```bash Bash icon="terminal" highlight={2} theme={"system"}
export NOVITA_API_KEY=sk_*** # Novita API key obtained from previous steps
```

## Use SDK to Start Agent Sandbox

Below is a simple example showing how to create a sandbox through the SDK and run specified commands.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  // index.ts
  import 'dotenv/config'
  import { Sandbox } from 'novita-sandbox/code-interpreter'

// The .env file should be located in the project root directory
// dotenv/config will automatically look for .env in the current working directory
// Or
// You can set the environment variable in the command line
// export NOVITA*API_KEY=sk*\*\*\*

const sandbox = await Sandbox.create()
const execution = await sandbox.runCode('print("hello world")')
console.log(execution.logs)

const files = await sandbox.files.list('/tmp')
console.log(files)

// Close sandbox when no longer needed
await sandbox.kill()

````

```python Python icon="python" theme={"system"}
# main.py
from dotenv import load_dotenv
from novita_sandbox.code_interpreter import Sandbox


# The .env file should be located in the project root directory
# dotenv will automatically look for .env in the current working directory
load_dotenv()

# Or
# You can set the environment variable in the command line
# export NOVITA_API_KEY=sk_***

sandbox = Sandbox.create()
execution = sandbox.run_code("print('hello world')")
print(execution.logs)

files = sandbox.files.list("/")
print(files)

# Close sandbox when no longer needed
sandbox.kill()
````

</CodeGroup>

Execute the following commands to run the above code.

<CodeGroup isTerminalCommand>
  ```bash index.ts icon="terminal" theme={"system"}
  npx tsx ./index.ts
  ```

```bash main.py icon="terminal" theme={"system"}
python main.py
```

</CodeGroup>

> ## Documentation Index
>
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# E2B SDK Compatibility

Novita Agent Sandbox provides a compatibility API that allows you to use the E2B SDK and CLI. This is useful if you are already using the E2B SDK and CLI and want to switch to Novita Agent Sandbox. However, we recommend using the Novita [Agent Sandbox SDK](/guides/sandbox-sdk-and-cli) to access all features.

## Installation

### Code Interpreter SDK

<CodeGroup>
  ```bash JavaScript & TypeScript icon="terminal" theme={"system"}
  npm i @e2b/code-interpreter@beta
  ```

```bash Python icon="terminal" theme={"system"}
pip install e2b-code-interpreter==1.2.0b5
```

</CodeGroup>

### Core SDK

<CodeGroup>
  ```bash JavaScript & TypeScript icon="terminal" theme={"system"}
  npm i e2b@beta
  ```

```bash Python icon="terminal" theme={"system"}
pip install e2b==1.2.0b6
```

</CodeGroup>

### Desktop SDK

<CodeGroup>
  ```bash JavaScript & TypeScript icon="terminal" theme={"system"}
  npm i @e2b/desktop@beta
  ```

```bash Python icon="terminal" theme={"system"}
pip install e2b-desktop==1.7.1b1
```

</CodeGroup>

### CLI

<CodeGroup>
  ```bash Bash icon="terminal" theme={"system"}
  npm i -g @e2b/cli@v1.9.2
  ```
</CodeGroup>

## Setup Configuration

You need to set the following environment variables in your project to use the E2B SDK and CLI with Novita Agent Sandbox.

```bash Bash icon="terminal" theme={"system"}
export E2B_DOMAIN=sandbox.novita.ai
export E2B_API_KEY="<Your Novita AI API Key>"
```

## Examples

Below is an example showing how to create a sandbox through the SDK and run specified commands using E2B SDK.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from '@e2b/code-interpreter'
  // or import { Sandbox } from 'e2b'
  // or import { Sandbox } from '@e2b/desktop'

const sbx = await Sandbox.create()
const execution = await sbx.commands.run('ls -l')
console.log(execution)

await sbx.kill()

````

```python Python icon="python" theme={"system"}
from e2b_code_interpreter import Sandbox
# or from e2b import Sandbox
# or from e2b_desktop import Sandbox

sbx = Sandbox.create()
execution = sbx.commands.run('ls -l')
print(execution)

sbx.kill()
````

</CodeGroup>

Below is an example showing how to use the E2B CLI with Novita Agent Sandbox.

<CodeGroup>
  ```bash Bash icon="terminal" theme={"system"}
  export E2B_DOMAIN=sandbox.novita.ai
  # Authentication in CLI
  e2b auth login

# Start sandbox and connect to terminal

e2b sandbox spawn <template-id>

# List sandboxes

e2b sandbox list

# Shutdown running sandboxes

e2b sandbox kill <sandbox-id>

```
</CodeGroup>
```
