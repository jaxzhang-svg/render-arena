> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sandbox Lifecycle

export const SandboxConfigHint = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Note>Before running the example code in this document, please ensure you have properly configured environment variables. For details, please refer to <a href="/guides/sandbox-your-first-agent-sandbox#configure-environment-variables">Configure Environment Variables</a>.</Note>;
  }
};

When you start the sandbox, it stays alive for 5 minutes by default but you can change it by passing the `timeout` parameter.
After the time passes, the sandbox will be automatically shutdown.

<SandboxConfigHint />

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  // Create sandbox with and keep it running for 60 seconds.
  const sandbox = await Sandbox.create({
    timeoutMs: 60_000, // The units are milliseconds.
  })

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  # Create sandbox with and keep it running for 60 seconds.
  sandbox = Sandbox.create(
    timeout=60, # The units are seconds.
  )

  sandbox.kill()
  ```
</CodeGroup>

## Change sandbox timeout during runtime

You can change the sandbox timeout when it's running by calling the the `setTimeout` method in JavaScript or `set_timeout` method in Python.

When you call the set timeout method, the sandbox timeout will be reset to the new value that you specified.

This can be useful if you want to extend the sandbox lifetime when it's already running.
You can for example start with a sandbox with 1 minute timeout and then periodically call set timout every time user interacts with it in your app.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  // Create sandbox with and keep it running for 60 seconds.
  const sandbox = await Sandbox.create({ timeoutMs: 60_000 })

  // Change the sandbox timeout to 30 seconds.
  // The new timeout will be 30 seconds from now.
  await sandbox.setTimeout(30_000)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  # Create sandbox with and keep it running for 60 seconds.
  sandbox = Sandbox.create(timeout=60)

  # Change the sandbox timeout to 30 seconds.
  # The new timeout will be 30 seconds from now.
  sandbox.set_timeout(30)

  sandbox.kill()
  ```
</CodeGroup>

## Retrieve sandbox information

You can retrieve sandbox information like sandbox ID, template, metadata, started at/end at date by calling the `getInfo` method in JavaScript or `get_info` method in Python.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  // Create sandbox with and keep it running for 60 seconds.
  const sandbox = await Sandbox.create({ timeoutMs: 60_000 })

  // Retrieve sandbox information.
  const info = await sandbox.getInfo()

  console.log(info)

  // Output example:
  // {
  //   sandboxId: 'i8kktl6jolbramfm8cp3k-a402f90a',
  //   templateId: '23j9hy90m6r461w7nkrn',
  //   name: 'code-interpreter-v1',
  //   metadata: {},
  //   envdVersion: '0.2.0',
  //   envdAccessToken: undefined,
  //   startedAt: 2025-06-30T06:46:36.096Z,
  //   endAt: 2025-06-30T07:16:36.096Z
  // }

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  # Create sandbox with and keep it running for 60 seconds.
  sandbox = Sandbox.create(timeout=60)

  # Retrieve sandbox information.
  info = sandbox.get_info()

  print(info)

  sandbox.kill()
  ```
</CodeGroup>

## Shutdown sandbox

You can shutdown the sandbox any time even before the timeout is up by calling the `kill` method.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  // Create sandbox with and keep it running for 60 seconds.
  const sandbox = await Sandbox.create({ timeoutMs: 60_000 })

  // Shutdown the sandbox immediately.
  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  # Create sandbox with and keep it running for 60 seconds.
  sandbox = Sandbox.create(timeout=60)

  # Shutdown the sandbox immediately.
  sandbox.kill()
  ```
</CodeGroup>

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sandbox Persistence

export const SandboxConfigHint = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Note>Before running the example code in this document, please ensure you have properly configured environment variables. For details, please refer to <a href="/guides/sandbox-your-first-agent-sandbox#configure-environment-variables">Configure Environment Variables</a>.</Note>;
  }
};

The sandbox persistence allows you to pause your sandbox and resume it later from the same state it was in when you paused it.

This includes not only state of the sandbox's filesystem but also the sandbox's memory. This means all running processes, loaded variables, data, etc.

<SandboxConfigHint />

<Warning>
  Please note:

  * It takes about 4 seconds per 1 GB RAM to pause the sandbox.
  * It takes about 1 second to resume the sandbox.
  * Sandbox can be used up to 30 days.\
    After 30 days from the initial sandbox create call, the data may be deleted and you will not be able to resume it. Attempting to resume a sandbox that was deleted or does not exist will result in the NotFoundError in the JavaScript SDK or the NotFoundException in the Python SDK.
</Warning>

## Pausing sandbox

When you pause a sandbox, both the sandbox's <Link href="/guides/sandbox-filesystem">filesystem</Link> and memory state will be saved. This includes all the files in the sandbox's filesystem and all the running processes, loaded variables, data, etc.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()
  console.log('Sandbox created', sandbox.sandboxId)

  // Pause the sandbox.
  // You can save the sandbox ID in your database
  // to resume the sandbox later
  const result = await sandbox.betaPause()
  console.log('Sandbox paused', sandbox.sandboxId, result)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()
  print('Sandbox created', sandbox.sandbox_id)

  # You can save the sandbox ID in your database
  # to resume the sandbox later
  sandbox.beta_pause()
  print('Sandbox paused', sandbox.sandbox_id)

  sandbox.kill()
  ```
</CodeGroup>

## Resuming sandbox

When you resume a sandbox, it will be in the same state it was in when you paused it.
This means that all the files in the sandbox's filesystem will be restored and all the running processes, loaded variables, data, etc. will be restored.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()
  console.log('Sandbox created', sandbox.sandboxId)

  // Pause the sandbox.
  // You can save the sandbox ID in your database
  // to resume the sandbox later
  const result = await sandbox.betaPause()
  console.log('Sandbox paused', sandbox.sandboxId, result)

  // Resume the sandbox from the same state.
  const resumedSandbox = await sandbox.connect()
  console.log('Sandbox resumed', resumedSandbox.sandboxId)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()
  print('Sandbox created', sandbox.sandbox_id)

  # Pause the sandbox.
  # You can save the sandbox ID in your database
  # to resume the sandbox later
  sandbox.beta_pause()
  print('Sandbox paused', sandbox.sandbox_id)

  # Resume the sandbox from the same state.
  connectedSandbox = sandbox.connect()
  print('Sandbox resumed', connectedSandbox.sandbox_id)

  sandbox.kill()
  ```
</CodeGroup>

## Listing paused sandboxes

You can list all paused sandboxes by calling the `Sandbox.list` method and supplying the `state` query parameter.
More information about using the method can be found in [List Sandboxes](/guides/sandbox-list).

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox, SandboxInfo } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  // List all paused sandboxes.
  const paginator = Sandbox.list({ query: { state: ['paused'] } })

  // Get all paused sandboxes.
  const sandboxes: SandboxInfo[] = []
  while (paginator.hasNext) {
    const items = await paginator.nextItems()
    sandboxes.push(...items)
  }

  console.log('all paused sandboxes', sandboxes)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox, SandboxQuery, SandboxState, SandboxInfo

  sandbox = Sandbox.create()

  sandbox.beta_pause()
  print('Sandbox paused', sandbox.sandbox_id)

  # List all paused sandboxes.
  paginator = Sandbox.list(query=SandboxQuery(state=[SandboxState.PAUSED]))

  # Get all paused sandboxes.
  sandboxes: list[SandboxInfo] = []
  while paginator.has_next:
    items = paginator.next_items()
    sandboxes.extend(items)

  print('all paused sandboxes', sandboxes)

  sandbox.kill()
  ```
</CodeGroup>

## Removing paused sandboxes

You can remove paused sandboxes by calling the `kill` method on the sandbox instance.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()
  console.log('Sandbox created', sandbox.sandboxId)

  // Pause the sandbox.
  await sandbox.betaPause()

  // Kill the paused sandbox.
  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()

  # Pause the sandbox.
  sandbox.beta_pause()

  # Kill the paused sandbox.
  sandbox.kill()
  ```
</CodeGroup>

## Sandbox's timeout

When you resume a sandbox, the sandbox's timeout is reset to the default timeout of a sandbox - 5 minutes.

You can pass a custom timeout to the `Sandbox.connect()` method like this:

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  const connectedSandbox = await Sandbox.connect(sandbox.sandboxId, { timeoutMs: 60 * 1000 })
  console.log('Sandbox connected', connectedSandbox.sandboxId)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()

  connectedSandbox = Sandbox.connect(sandbox.sandbox_id, timeout=60) # 60 seconds
  print('Sandbox connected', connectedSandbox.sandbox_id)

  sandbox.kill()
  ```
</CodeGroup>

## Network

If you have a service (for example a server) running inside your sandbox and you pause the sandbox, the service won't be accessible from the outside and all the clients will be disconnected.
If you resume the sandbox, the service will be accessible again but you need to connect clients again.

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sandbox Metrics

export const SandboxConfigHint = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Note>Before running the example code in this document, please ensure you have properly configured environment variables. For details, please refer to <a href="/guides/sandbox-your-first-agent-sandbox#configure-environment-variables">Configure Environment Variables</a>.</Note>;
  }
};

The sandbox metrics allows you to get information about the sandbox's CPU and memory usage.

<SandboxConfigHint />

## Getting sandbox metrics

Getting the metrics of a sandbox returns an array of timestamped metrics containing CPU and memory usage information.
The metrics are collected at the start of the sandbox, then every 2 seconds, and finally right before the sandbox is deleted.

### Getting sandbox metrics using the SDKs

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()
  console.log('Sandbox created', sandbox.sandboxId)

  let metrics = await sandbox.getMetrics()

  // You can also get the metrics by sandbox ID:
  // const metrics = await Sandbox.getMetrics(sbx.sandboxId)

  while (metrics && metrics.length <= 1) {
      console.log('Waiting for metrics...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      metrics = await sandbox.getMetrics()
  }

  console.log('Sandbox metrics:', metrics)

  // Example output:
  // Sandbox metrics: [
  //   {
  //     cpuCount: 2,
  //     cpuUsedPct: 17.85,
  //     memTotalMiB: 987,
  //     memUsedMiB: 245,
  //     timestamp: '2025-06-30T06:49:15.243Z'
  //   },
  //   {
  //     cpuCount: 2,
  //     cpuUsedPct: 0.4,
  //     memTotalMiB: 987,
  //     memUsedMiB: 246,
  //     timestamp: '2025-06-30T06:49:20.237Z'
  //   }
  // ]

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox
  import time

  sandbox = Sandbox.create()
  print('Sandbox created', sandbox.sandbox_id)

  metrics = sandbox.get_metrics()

  # You can also get the metrics by sandbox ID:
  # metrics = Sandbox.get_metrics(sbx.sandbox_id)

  while len(metrics) <= 1:
      print('Waiting for metrics...')
      time.sleep(1)
      metrics = sandbox.get_metrics()

  print('Sandbox metrics', metrics)

  # Example output:
  # Sandbox metrics [SandboxMetrics(timestamp=datetime.datetime(2025, 6, 30, 6, 51, 13, 169230, tzinfo=tzutc()), cpu_used_pct=17.87, cpu_count=2, mem_used_mib=245, mem_total_mib=987), SandboxMetrics(timestamp=datetime.datetime(2025, 6, 30, 6, 51, 18, 165258, tzinfo=tzutc()), cpu_used_pct=0.4, cpu_count=2, mem_used_mib=246, mem_total_mib=987)]

  sandbox.kill()
  ```
</CodeGroup>

### Getting sandbox metrics using the CLI

```bash Bash icon="terminal" theme={"system"}
novita-sandbox-cli sandbox metrics <sandbox_id>
```

## Limitations

* It may take a second or more to get the metrics after the sandbox is created. Until the logs are collected from the sandbox, you will get an empty array.

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sandbox Metadata

Metadata is a way to attach arbitrary key-value pairs for a sandbox.

This is useful in various scenarios, for example:

* Associate a sandbox with a user session.
* Store custom user data for a sandbox like API keys.
* Associate a sandbox with a user ID and [connect to it later](/guides/sandbox-connect).

You specify metadata when creating a sandbox and can access it later through listing running sandboxes with `Sandbox.list()` method.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  // Create sandbox with metadata.
  const sandbox = await Sandbox.create({
    metadata: {
      userId: '123',
    },
  })

  // List running sandboxes and access metadata.
  const runningSandboxesPaginator = await Sandbox.list({
    query: {
      state: ["running"],
    },
  })

  const runningSandboxes = await runningSandboxesPaginator.nextItems()

  console.log("runningSandboxes[0].metadata: ", runningSandboxes[0].metadata)

  // Example output:
  // { userId: '123' }

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox, SandboxQuery, SandboxState

  # Create sandbox with metadata.
  sandbox = Sandbox.create(
    metadata={
      'userId': '123',
    },
  )

  # List running sandboxes and access metadata.
  running_sandboxes_paginator = Sandbox.list(
    query=SandboxQuery(
      state=[SandboxState.RUNNING],
    ),
  )
  running_sandboxes = running_sandboxes_paginator.next_items()

  print(running_sandboxes[0].metadata)

  # Example output:
  # { userId: '123' }

  sandbox.kill()
  ```
</CodeGroup>

## Filtering sandboxes by metadata

You can also filter sandboxes by metadata, you can find more about it [here](/guides/sandbox-list#filtering-sandboxes).

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Environment variables

export const SandboxConfigHint = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Note>Before running the example code in this document, please ensure you have properly configured environment variables. For details, please refer to <a href="/guides/sandbox-your-first-agent-sandbox#configure-environment-variables">Configure Environment Variables</a>.</Note>;
  }
};

This page covers how to set and use environment variables in a sandbox, and default environment variables inside the sandbox.

<SandboxConfigHint />

## Setting environment variables

There are 3 ways to set environment variables in a sandbox:

* [Global environment variables when creating the sandbox](#1-global-environment-variables).
* [When running code in the sandbox](#2-setting-environment-variables-when-running-code).
* [When running commands in the sandbox](#3-setting-environment-variables-when-running-commands).

### 1. Global environment variables

You can set global environment variables when creating a sandbox.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create({
    envs: {
      MY_VAR: 'my_value',
    },
  })

  const result = await sandbox.commands.run("echo $MY_VAR")

  console.log(result)

  // Output example:
  // { exitCode: 0, error: undefined, stdout: 'my_value\n', stderr: '' }

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create(
    envs={
      'MY_VAR': 'my_value',
    },
  )

  result = sandbox.commands.run("echo $MY_VAR")

  print(result)

  # Output example:
  # { exitCode: 0, error: undefined, stdout: '123\n', stderr: '' }

  sandbox.kill()
  ```
</CodeGroup>

### 2. Setting environment variables when running code

You can set environment variables for specific code execution call in the sandbox.

<Note>
  If you had a global environment variable with the same name, it will be overridden.
</Note>

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  const result = await sandbox.runCode('import os; print(os.environ.get("MY_VAR"))', {
    envs: {
      MY_VAR: 'my_value',
    },
  })
  console.log(result.logs)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()
  result = sandbox.run_code(
      'import os; print(os.environ.get("MY_VAR"))',
      envs={
          'MY_VAR': 'my_value'
      }
  )

  print(result)

  sandbox.kill()
  ```
</CodeGroup>

### 3. Setting environment variables when running commands

You can set environment variables for specific command execution in the sandbox.

<Note>
  If you had a global environment variable with the same name, it will be overridden.
</Note>

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  const result = await sandbox.commands.run('echo $MY_VAR', {
    envs: {
      MY_VAR: '123',
    },
  })

  console.log(result)

  // Output example:
  // { exitCode: 0, error: undefined, stdout: '123\n', stderr: '' }

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()
  result = sandbox.commands.run(
      'echo $MY_VAR',
      envs={
          'MY_VAR': '123'
      }
  )

  print(result)

  # Output example:
  # CommandResult(stderr='', stdout='123\n', exit_code=0, error='')

  sandbox.kill()
  ```
</CodeGroup>

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List sandboxes

export const SandboxConfigHint = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Note>Before running the example code in this document, please ensure you have properly configured environment variables. For details, please refer to <a href="/guides/sandbox-your-first-agent-sandbox#configure-environment-variables">Configure Environment Variables</a>.</Note>;
  }
};

You can list sandboxes using the `Sandbox.list()` method.

<SandboxConfigHint />

<Note>
  Once you have information about running sandbox, you can [connect](/guides/sandbox-connect) to it using the `Sandbox.connect()` method.
</Note>

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  // Create a sandbox.
  const sandbox = await Sandbox.create({
    metadata: {
      name: 'My Sandbox',
    },
  })

  // List all running sandboxes.
  const runningSandboxesPaginator = await Sandbox.list({
    query: {
      state: ["running"],
    },
  })

  const runningSandboxes = await runningSandboxesPaginator.nextItems()
  const runningSandbox = runningSandboxes[0]

  console.log('Running sandbox metadata:', runningSandbox.metadata)
  console.log('Running sandbox id:', runningSandbox.sandboxId)
  console.log('Running sandbox started at:', runningSandbox.startedAt)
  console.log('Running sandbox template id:', runningSandbox.templateId)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox, SandboxQuery, SandboxState

  sandbox = Sandbox.create(
    metadata= {
      'name': 'My Sandbox',
    },
  )

  # List all running sandboxes.
  running_sandboxes_paginator = Sandbox.list(
    query=SandboxQuery(
      state=[SandboxState.RUNNING],
    ),
  )

  running_sandboxes = running_sandboxes_paginator.next_items()

  running_sandbox = running_sandboxes[0]
  print('Running sandbox metadata:', running_sandbox.metadata)
  print('Running sandbox id:', running_sandbox.sandbox_id)
  print('Running sandbox started at:', running_sandbox.started_at)
  print('Running sandbox template id:', running_sandbox.template_id)

  sandbox.kill()
  ```
</CodeGroup>

## Filtering sandboxes

You can filter sandboxes by specifying <Link href="/guides/sandbox-metadata">Metadata</Link> key value pairs.
Specifying multiple key value pairs will return sandboxes that match all of them.

This can be useful when you have a large number of sandboxes and want to find only specific ones. The filtering is performed on the server.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  // Create a sandbox with metadata.
  const sandbox = await Sandbox.create({
    metadata: {
      env: 'dev',
      app: 'my-app',
      userId: '123',
    },
  })

  // List all running sandboxes that has `userId` key with value `123` and `env` key with value `dev`.
  const runningSandboxesPaginator = await Sandbox.list({
    query: {
      metadata: { userId: '123', env: 'dev' },
    },
  })

  const runningSandboxes = await runningSandboxesPaginator.nextItems()
  for (const runningSandbox of runningSandboxes) {
    console.log(`list running sandbox (${runningSandbox.sandboxId}) metadata:`, runningSandbox.metadata)
  }

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox, SandboxQuery

  # Create sandbox with metadata.
  sandbox = Sandbox.create(
      metadata={
          "env": "dev",
          "app": "my-app",
          "user_id": "123",
      },
  )

  # List all running sandboxes that has `user_id` key with value `123` and `env` key with value `dev`.
  paginator = Sandbox.list(
      query=SandboxQuery(
          metadata={
              "user_id": "123",
              "env": "dev",
          }
      ),
  )

  sandbox.kill()
  ```
</CodeGroup>

### Listing sandboxes

The `Sandbox.list()` method now supports pagination. In the [advanced pagination](#advanced-pagination) section, you can find more information about pagination techniques using the updated method.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js"  theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  const paginator = Sandbox.list()

  // Get the first page of sandboxes (running and paused)
  const firstPage = await paginator.nextItems()
  if (paginator.hasNext) {
      // Get the next page of sandboxes
      const nextPage = await paginator.nextItems()
  }

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()

  # List all sandboxes (running and paused)
  paginator = Sandbox.list()

  firstPage = paginator.next_items()
  if paginator.has_next:
      nextPage = paginator.next_items()

  sandbox.kill()
  ```
</CodeGroup>

### Filtering sandboxes

Filter sandboxes by their current state. The state parameter can contain either "**running**" for running sandboxes or "**paused**" for paused sandboxes, or both.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  // List all sandboxes that are running or paused.
  const paginator = Sandbox.list({
    query: {
      state: ['running', 'paused'],
    },
  })

  const sandboxes = await paginator.nextItems()

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox, SandboxQuery, SandboxState

  sandbox = Sandbox.create()

  # List all sandboxes that are running or paused.
  paginator = Sandbox.list(
      query=SandboxQuery(
          state=[SandboxState.RUNNING, SandboxState.PAUSED],
      ),
  )

  # Get the first page of sandboxes (running and paused)
  sandboxes = paginator.next_items()

  sandbox.kill()
  ```
</CodeGroup>

Filter sandboxes by the metadata key value pairs specified during Sandbox creation.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  // Create sandbox with metadata.
  const sandbox = await Sandbox.create({
    metadata: {
      env: 'dev',
      app: 'my-app',
      userId: '123',
    },
  })

  // List all sandboxes that has `userId` key with value `123` and `env` key with value `dev`.
  const paginator = Sandbox.list({
    query: {
      metadata: { userId: '123', env: 'dev' },
    },
  })

  const sandboxes = await paginator.nextItems()

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox, SandboxQuery

  # Create sandbox with metadata.
  sandbox = Sandbox.create(
      metadata={
          "env": "dev",
          "app": "my-app",
          "user_id": "123",
      },
  )

  # List all sandboxes that has `userId` key with value `123` and `env` key with value `dev`.
  paginator = Sandbox.list(
      query=SandboxQuery(
          metadata={
              "user_id": "123",
              "env": "dev",
          }
      ),
  )

  sandboxes = paginator.next_items()

  sandbox.kill()
  ```
</CodeGroup>

### Advanced pagination

For more granular pagination, you can set custom per-page item limit (default and maximum is **1000**) and specify an offset parameter (`nextToken` or `next_token`) to start paginating from.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  const paginator = Sandbox.list({
    limit: 1000,
    // nextToken: '<base64-encoded-token>',
  })

  // Fetch the next page
  await paginator.nextItems()

  // Additional paginator properties
  // Whether there is a next page
  console.log("paginator.hasNext: ", paginator.hasNext)

  // Next page token
  console.log("paginator.nextToken: ", paginator.nextToken)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()

  paginator = Sandbox.list(
      limit=1000,
      # next_token='<base64-encoded-token>',
  )

  # Fetch the next page
  paginator.next_items()

  # Whether there is a next page
  print("paginator.has_next: ", paginator.has_next)

  # Next page offset parameter
  print("paginator.next_token: ", paginator.next_token)

  sandbox.kill()
  ```
</CodeGroup>

You can fetch all pages by looping through the paginator while checking if there is a next page (using `hasNext` or `has_next` property) and fetching until there are no more pages left to fetch:

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox, SandboxInfo } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  const paginator = Sandbox.list()

  const sandboxes: SandboxInfo[] = []
  while (paginator.hasNext) {
    const items = await paginator.nextItems()
    sandboxes.push(...items)
  }

  for (const sandbox of sandboxes) {
    console.log(`list sandbox (${sandbox.sandboxId})`)
  }

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox, SandboxInfo

  sandbox = Sandbox.create()

  paginator = Sandbox.list()

  # Get all sandboxes
  sandboxes: list[SandboxInfo] = []
  while paginator.has_next:
      items = paginator.next_items()
      sandboxes.extend(items)

  sandbox.kill()
  ```
</CodeGroup>

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Connect to running sandbox

export const SandboxConfigHint = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Note>Before running the example code in this document, please ensure you have properly configured environment variables. For details, please refer to <a href="/guides/sandbox-your-first-agent-sandbox#configure-environment-variables">Configure Environment Variables</a>.</Note>;
  }
};

If you have a running sandbox, you can connect to it using the `Sandbox.connect()` method and then start controlling it with our SDK.

This is useful if you want to, for example, reuse the same sandbox instance for the same user after a short period of inactivity.

<SandboxConfigHint />

## 1. Get the sandbox ID

To connect to a running sandbox, you first need to retrieve its ID. You can do this by calling the `Sandbox.list()` method.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from "novita-sandbox/code-interpreter"

  // Get all running sandboxes
  const runningSandboxesPaginator = await Sandbox.list({
    query: {
      state: ["running"],
    },
  })

  const runningSandboxes = await runningSandboxesPaginator.nextItems()
  if (runningSandboxes.length === 0) {
    throw new Error("No running sandboxes found")
  }
  const runningSandboxId = runningSandboxes[0].sandboxId

  console.log(`got a running sandbox: ${runningSandboxId}`)
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox, SandboxQuery, SandboxState

  sandbox = Sandbox.create()

  # Get all running sandboxes
  running_sandboxes_paginator = Sandbox.list(query=SandboxQuery(state=[SandboxState.RUNNING]))

  running_sandboxes = running_sandboxes_paginator.next_items()
  if len(running_sandboxes) == 0:
    raise Exception("No running sandboxes found")
  running_sandbox_id = running_sandboxes[0].sandbox_id

  # got a running sandbox.
  print("got a running sandbox: ", running_sandbox_id)

  sandbox.kill()
  ```
</CodeGroup>

## 2. Connect to the sandbox

Now that you have the sandbox ID, you can connect to the sandbox using the `Sandbox.connect()` method.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from "novita-sandbox/code-interpreter"

  // Get all running sandboxes
  const runningSandboxesPaginator = await Sandbox.list({
    query: {
      state: ["running"],
    },
  })

  const runningSandboxes = await runningSandboxesPaginator.nextItems()
  if (runningSandboxes.length === 0) {
    throw new Error("No running sandboxes found")
  }
  const runningSandboxId = runningSandboxes[0].sandboxId

  // connect to the sandbox.
  const sandbox = await Sandbox.connect(runningSandboxId)
  console.log("connected to sandbox: ", sandbox.sandboxId)

  // Now you can use the sandbox as usual
  // ...
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox, SandboxQuery, SandboxState

  sandbox = Sandbox.create()

  # Get all running sandboxes.
  running_sandboxes_paginator = Sandbox.list(query=SandboxQuery(state=[SandboxState.RUNNING]))

  running_sandboxes = running_sandboxes_paginator.next_items()
  if len(running_sandboxes) == 0:
    raise Exception("No running sandboxes found")
  running_sandbox_id = running_sandboxes[0].sandbox_id

  # connect to the sandbox.
  sandbox = Sandbox.connect(running_sandbox_id)
  print("got a running sandbox: ", sandbox.sandbox_id)

  # Now you can use the sandbox as usual
  # ...

  sandbox.kill()
  ```
</CodeGroup>

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Internet access

export const SandboxConfigHint = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Note>Before running the example code in this document, please ensure you have properly configured environment variables. For details, please refer to <a href="/guides/sandbox-your-first-agent-sandbox#configure-environment-variables">Configure Environment Variables</a>.</Note>;
  }
};

Every sandbox has access to the internet and can be reached by a public URL.

<SandboxConfigHint />

## Sandbox public URL

Every sandbox has a public URL that can be used to access running services inside the sandbox.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  // You need to always pass a port number to get the host
  const host = sandbox.getHost(3000)
  console.log(`https://${host}`)

  // Example output:
  // https://3000-idpw1qdrbcciscn2r8lw7-82b888ba.sandbox.novita.ai

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()

  # You need to always pass a port number to get the host
  host = sandbox.get_host(3000)
  print(f'https://{host}')

  # Example output:
  # https://3000-i9y92beaqiyor8x3josfy-82b888ba.sandbox.novita.ai

  sandbox.kill()
  ```
</CodeGroup>

The first leftmost part of the host is the port number we passed to the method.

## Connecting to a server running inside the sandbox

You can start a server inside the sandbox and connect to it using the approach above.

In this example we will start a simple HTTP server that listens on port 3000 and responds with the content of the directory where the server is started.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter'

  const sandbox = await Sandbox.create()

  // Start a simple HTTP server inside the sandbox.
  const commandHandle = await sandbox.commands.run('python -m http.server 3000', { background: true })
  const host = sandbox.getHost(3000)
  const url = `https://${host}`
  console.log('Server started at:', url)

  // Fetch data from the server inside the sandbox.
  const response = await fetch(url);
  const data = await response.text();
  console.log('Response from server inside sandbox:', data);

  // Kill the server process inside the sandbox.
  await commandHandle.kill()

  // Example output:
  // Server started at: https://3000-ibbw4zmqp38s77v1vbykj-d0b9e1e2.sandbox.novita.ai
  // Response from server inside sandbox: <!DOCTYPE HTML>
  // <html lang="en">
  // <head>
  // <meta charset="utf-8">
  // <title>Directory listing for /</title>
  // </head>
  // <body>
  // <h1>Directory listing for /</h1>
  // <hr>
  // <ul>
  // <li><a href=".bash_logout">.bash_logout</a></li>
  // <li><a href=".bashrc">.bashrc</a></li>
  // <li><a href=".profile">.profile</a></li>
  // </ul>
  // <hr>
  // </body>
  // </html>

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.code_interpreter import Sandbox

  sandbox = Sandbox.create()

  # Start a simple HTTP server inside the sandbox.
  command_handle = sandbox.commands.run("python -m http.server 3000", background=True)
  host = sandbox.get_host(3000)
  url = f"https://{host}"
  print('Server started at:', url)

  # Fetch data from the server inside the sandbox.
  response = sandbox.commands.run(f"curl {url}")
  data = response.stdout
  print("Response from server inside sandbox:", data)

  # Kill the server process inside the sandbox.
  command_handle.kill()

  # Example output:
  # Server started at: https://3000-i0iq56w6786bz91034h8l-82b888ba.sandbox.novita.ai
  # Response from server inside sandbox: <!DOCTYPE HTML>
  # <html lang="en">
  # <head>
  # <meta charset="utf-8">
  # <title>Directory listing for /</title>
  # </head>
  # <body>
  # <h1>Directory listing for /</h1>
  # <hr>
  # <ul>
  # <li><a href=".bash_logout">.bash_logout</a></li>
  # <li><a href=".bashrc">.bashrc</a></li>
  # <li><a href=".profile">.profile</a></li>
  # </ul>
  # <hr>
  # </body>
  # </html>

  sandbox.kill()
  ```
</CodeGroup>

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Mount object storage bucket in sandbox

export const SandboxConfigHint = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Note>Before running the example code in this document, please ensure you have properly configured environment variables. For details, please refer to <a href="/guides/sandbox-your-first-agent-sandbox#configure-environment-variables">Configure Environment Variables</a>.</Note>;
  }
};

Each sandbox instance is provisioned with 20GB of ephemeral system disk storage by default for temporary data operations. <u>Upon sandbox termination or timeout, all data within this storage space is automatically purged</u>. Consequently, persistent data requiring long-term retention should be stored in external cloud storage services.

<Tip>
  Sandbox storage allocation specifications are subject to modification. Consult the [Pricing](/guides/sandbox-pricing) documentation for current resource allocations and associated costs.
</Tip>

Object Storage represents a highly scalable, durable, and cost-efficient cloud storage architecture offered by major cloud service providers. Within sandbox environments, object storage can be accessed through two primary methodologies: direct programmatic interaction via cloud provider SDKs or CLI utilities, or through FUSE (Filesystem in Userspace) implementations that present object storage buckets as standard POSIX-compliant filesystem mounts.

<Tip>
  [FUSE (Filesystem in Userspace)](https://www.kernel.org/doc/html/next/filesystems/fuse.html) is a kernel module and userspace library that enables the implementation of fully functional filesystems in userspace applications. This framework provides an abstraction layer that presents remote cloud storage services as standard filesystem hierarchies, enabling transparent file operations through conventional POSIX interfaces.
</Tip>

This documentation provides comprehensive guidance for integrating object storage buckets from leading cloud service providers into sandbox environments through filesystem mounting techniques.

<Warning>
  FUSE-based object storage mounts introduce significant I/O performance overhead due to network latency and protocol translation layers. Applications with stringent performance requirements should avoid this approach. Furthermore, FUSE filesystem operations lack atomicity guarantees inherent to native object storage APIs, creating potential race conditions where local filesystem operations may succeed while corresponding remote operations fail, resulting in data inconsistency.

  This mounting approach is optimal for read-heavy workloads with infrequent write operations and relaxed performance constraints. For performance-critical applications or frequent write patterns, direct integration using cloud provider SDKs or native REST APIs is strongly recommended.
</Warning>

<SandboxConfigHint />

## Amazon S3

Amazon S3 buckets can be mounted as POSIX-compliant filesystems using [s3fs-fuse](https://github.com/s3fs-fuse/s3fs-fuse), a FUSE-based filesystem implementation that provides S3 bucket access through standard file operations.

The s3fs-fuse package can be integrated during [sandbox template](/guides/sandbox-template) creation by incorporating installation commands in the `novita.Dockerfile`, or installed dynamically within active sandbox instances for ad-hoc requirements.

The following `novita.Dockerfile` demonstrates the integration of s3fs-fuse during template building:

<CodeGroup>
  ```dockerfile novita.Dockerfile icon="docker" theme={"system"}
  # Compatible with Debian-based distributions
  FROM ubuntu:latest

  # Critical: s3fs versions below 1.93 contain known mounting issues. Ensure version compatibility.
  RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y s3fs
  ```
</CodeGroup>

The following implementation demonstrates programmatic S3 bucket mounting within sandbox environments using s3fs-fuse:

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox'

  const TEMPLATE_ID = process.env.NOVITA_TEMPLATE_ID
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
  const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
  if (!TEMPLATE_ID || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET_NAME) {
      throw new Error('Required environment variables not configured: NOVITA_TEMPLATE_ID, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME')
  }

  const MOUNT_DIRECTORY = "/mnt/s3-bucket"

  const sandbox = await Sandbox.create(TEMPLATE_ID)

  // Initialize mount point directory structure
  await sandbox.files.makeDir(MOUNT_DIRECTORY)

  // Configure s3fs credentials using standard credential file location
  // s3fs-fuse reads AWS credentials from /root/.passwd-s3fs by default
  await sandbox.files.write('/root/.passwd-s3fs', `${AWS_ACCESS_KEY_ID}:${AWS_SECRET_ACCESS_KEY}`)

  // Enforce secure credential file permissions (owner read-only)
  await sandbox.commands.run('sudo chmod 600 /root/.passwd-s3fs')

  // Execute S3 bucket mount operation with optimized parameters
  // Configuration parameters:
  // - allow_other: Enable cross-user filesystem access
  // - endpoint: Specify AWS regional endpoint for optimal latency
  // Reference: https://manpages.ubuntu.com/manpages/noble/en/man1/s3fs.1.html
  const mountOptions = 'allow_other,endpoint=us-east-1'
  await sandbox.commands.run(`sudo s3fs ${AWS_BUCKET_NAME} ${MOUNT_DIRECTORY} -o ${mountOptions}`)

  // Validate mount functionality with write operation
  await sandbox.files.write(`${MOUNT_DIRECTORY}/test-file.txt`, 'test-file-content')

  // Verify mount integrity through read operation
  const content = await sandbox.files.read(`${MOUNT_DIRECTORY}/test-file.txt`)
  console.log(content)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  import os
  from novita_sandbox.core import Sandbox

  TEMPLATE_ID = os.environ.get("NOVITA_TEMPLATE_ID")
  AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
  AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
  AWS_BUCKET_NAME = os.environ.get("AWS_BUCKET_NAME")
  if not TEMPLATE_ID or not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY or not AWS_BUCKET_NAME:
      raise ValueError("Required environment variables not configured: NOVITA_TEMPLATE_ID, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME")

  MOUNT_DIRECTORY = "/mnt/s3-bucket"

  sandbox = Sandbox.create(TEMPLATE_ID)

  # Initialize mount point directory structure
  sandbox.files.make_dir(MOUNT_DIRECTORY)

  # Configure s3fs credentials using standard credential file location
  # s3fs-fuse reads AWS credentials from /root/.passwd-s3fs by default
  # Custom credential paths require explicit specification via -o passwd_file parameter
  sandbox.files.write("/root/.passwd-s3fs", f"{AWS_ACCESS_KEY_ID}:{AWS_SECRET_ACCESS_KEY}")

  # Enforce secure credential file permissions (owner read-only)
  sandbox.commands.run("sudo chmod 600 /root/.passwd-s3fs")

  # Execute S3 bucket mount operation with optimized parameters
  # Configuration parameters:
  # - allow_other: Enable cross-user filesystem access
  # - endpoint: Specify AWS regional endpoint for optimal latency
  # Reference: https://manpages.ubuntu.com/manpages/noble/en/man1/s3fs.1.html
  mount_options = "allow_other,endpoint=cn-north-1"
  sandbox.commands.run(f"sudo s3fs {AWS_BUCKET_NAME} {MOUNT_DIRECTORY} -o {mount_options}")

  # Validate mount functionality with write operation
  write_result = sandbox.files.write(f"{MOUNT_DIRECTORY}/test-file.txt", "test-file-content")

  # Verify mount integrity through read operation
  content = sandbox.files.read(f"{MOUNT_DIRECTORY}/test-file.txt")
  print("File content:", content)

  sandbox.kill()
  ```
</CodeGroup>

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Auto Pause and Resume

export const SandboxBetaVersionWarning = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Warning>The following features require <Link href="/guides/sandbox-sdk-and-cli#install-beta-sdk" target="self">installing the Beta SDK & CLI</Link>. Please note that beta features are subject to change and may be less stable than production releases. If you encounter any issues while using these features, please <Link href="https://meetings-na2.hubspot.com/junyu" target="_blank">contact us</Link>.</Warning>;
  }
};

<SandboxBetaVersionWarning />

When the sandbox instance is not currently needed but you need to be able to resume it at any time later, you can refer to the [documentation](/guides/sandbox-persistence) to manually pause and resume sandbox instances.

The **"Auto Pause and Resume"** feature allows your sandbox instance to automatically pause after [timeout](/guides/sandbox-lifecycle) and resume when needed. When you attempt to perform operations (such as executing commands, running code, or file operations) on a paused sandbox, it will automatically resume without manual intervention.

## Enable Auto Pause

You can enable the auto pause feature by setting the `auto_pause` parameter to `true` when creating a sandbox instance. The sandbox instance will automatically pause after timeout and can be resumed later.

<Warning>
  Note: The resumed sandbox instance will still have the auto pause feature enabled and will automatically pause again after timeout.
</Warning>

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter';

  const sandbox = await Sandbox.create(
      {
          timeoutMs: 5_000,
          autoPause: true
      },
  );
  console.log('Sandbox created', sandbox.sandboxId)

  console.log('Waiting for 10 seconds...')
  await new Promise(resolve => setTimeout(resolve, 10000));

  const resumedSandbox = await Sandbox.connect(sandbox.sandboxId)
  console.log('Sandbox resumed', resumedSandbox.sandboxId)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.core import Sandbox
  import time

  sandbox = Sandbox.create(
      timeout=5,
      auto_pause=True,
  )
  print('Sandbox created', sandbox.sandbox_id)

  print('Waiting for 10 seconds...')
  time.sleep(10)

  resumed_sandbox = Sandbox.connect(sandbox.sandbox_id)
  print('Sandbox resumed', resumed_sandbox.sandbox_id)

  sandbox.kill()
  ```
</CodeGroup>

## Enable Auto Resume

You can enable the auto resume feature by setting the `auto_resume` key in `metadata` to `true` when creating a sandbox instance. Once enabled, when you attempt to operate on a paused sandbox (such as executing commands, running code, file operations, etc.), the sandbox will automatically resume.

<Warning>
  Note: The default timeout for the resumed sandbox is 5 minutes. You can update the sandbox timeout using the `setTimeout` or `set_timeout` method.
</Warning>

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter';

  const sandbox = await Sandbox.create(
      {
          metadata:{"auto_resume": "true"}
      }
  );
  console.log('Sandbox created', sandbox.sandboxId)

  await sandbox.betaPause()
  console.log('Sandbox paused', sandbox.sandboxId)

  const result = await sandbox.commands.run('ls -al')
  console.log('Command result', result)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.core import Sandbox

  sandbox = Sandbox.create(
      metadata={
          "auto_resume": "true",
      }
  )
  print('Sandbox created', sandbox.sandbox_id)

  sandbox.beta_pause()
  print('Sandbox paused', sandbox.sandbox_id)

  result = sandbox.commands.run('ls -al')
  print('Command result', result)

  sandbox.kill()
  ```
</CodeGroup>

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sandbox Clone

export const SandboxBetaVersionWarning = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Warning>The following features require <Link href="/guides/sandbox-sdk-and-cli#install-beta-sdk" target="self">installing the Beta SDK & CLI</Link>. Please note that beta features are subject to change and may be less stable than production releases. If you encounter any issues while using these features, please <Link href="https://meetings-na2.hubspot.com/junyu" target="_blank">contact us</Link>.</Warning>;
  }
};

<SandboxBetaVersionWarning />

The **"Sandbox Clone"** feature allows you to duplicate a running or paused sandbox instance. The cloned sandbox maintains the same <u>file system and memory state</u> as the original sandbox.

<Warning>
  If you clone a running sandbox, the sandbox being cloned will be briefly suspended. During this period, the sandbox instance will be unavailable, and the suspension time is close to the time required to <Link href="/guides/sandbox-persistence#pausing-sandbox">pause a sandbox</Link>.
</Warning>

**Parameter Description:**

* `count`: Specifies how many sandbox instances to clone. The minimum value is 1, and the maximum is determined by the concurrent running sandbox instance limit (see [Quota Limit](/guides/sandbox-quota-limit)).
* `strict`: Specifies whether to strictly clone according to the number specified in the `count` parameter. The default value is false. When set to true, if the number of successfully cloned instances is less than `count`, a clone failure error will be returned, and other successfully created sandboxes will also be cleaned up. When set to false, the actual number of successfully cloned sandbox instances will be returned.
* `timeout`(`timeoutMs`): Specifies the timeout for cloning sandbox instances. If this parameter is not specified, when the parent sandbox is running, it inherits the parent sandbox's timeout configuration; but when the parent sandbox is in a paused state, the default value of 5min is used.

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox';

  const sandbox = await Sandbox.create();
  console.log('Sandbox created', sandbox.sandboxId)

  const sbxClones = await Sandbox.clone(sandbox.sandboxId, 
      {
          count: 2,
          strict: false,
          timeoutMs: 100_000
      }
  );
  console.log('Sandbox clones created', sbxClones.map(sbxClone => sbxClone.sandboxId))

  await sandbox.kill()
  for (const sbxClone of sbxClones) {
      await sbxClone.kill()
  }
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.core import Sandbox

  sandbox = Sandbox.create()
  print('Sandbox created', sandbox.sandbox_id)

  sbxClones = Sandbox.clone(
      sandbox.sandbox_id, 
      count=2, 
      strict=False, 
      timeout=60
  )
  print('Sandbox clones created', [sbxClone.sandbox_id for sbxClone in sbxClones])

  sandbox.kill()
  for sbxClone in sbxClones:
      sbxClone.kill()
  ```
</CodeGroup>

Additionally, you can also use the [Novita Sandbox CLI](/guides/sandbox-cli) to clone a specified sandbox instance:

```bash Bash icon="terminal" theme={"system"}
# novita-sandbox-cli sandbox clone [sandboxID] -c [count] -s [strict] -t [timeout]
novita-sandbox-cli sandbox clone 0r0efkbfwzfp9p7qpc1c -c 2
```

> ## Documentation Index
> Fetch the complete documentation index at: https://novita.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Idle Timeout

export const SandboxBetaVersionWarning = () => {
  if (typeof document === "undefined") {
    return null;
  } else {
    return <Warning>The following features require <Link href="/guides/sandbox-sdk-and-cli#install-beta-sdk" target="self">installing the Beta SDK & CLI</Link>. Please note that beta features are subject to change and may be less stable than production releases. If you encounter any issues while using these features, please <Link href="https://meetings-na2.hubspot.com/junyu" target="_blank">contact us</Link>.</Warning>;
  }
};

<SandboxBetaVersionWarning />

We can set a timeout for each sandbox (refer to [Lifecycle Management](/guides/sandbox-lifecycle)). When the sandbox running time reaches the timeout, the sandbox will be automatically killed. However, in some scenarios, we cannot determine the expected running time of the sandbox, but we want the sandbox to be automatically killed when not in use to save costs. In this case, you can use the **"Idle Timeout"** feature.

When creating a sandbox, we can set the `idle_timeout` parameter in metadata (unit: seconds, minimum is 60) to enable the **"Idle Timeout"** feature. Once enabled, when the system detects that the sandbox has no operations (executing commands, running code, file operations, etc.) within the specified time range, the system will kill the sandbox instance. Otherwise, the sandbox will continue to run until it reaches the maximum time limit for sandbox operation (currently default is 3600 seconds).

Please refer to the following example:

<CodeGroup>
  ```js JavaScript & TypeScript icon="js" theme={"system"}
  import { Sandbox } from 'novita-sandbox/code-interpreter';

  const sandbox = await Sandbox.create(
      {
          metadata: { "idle_timeout": "60" }
      }
  );
  console.log('Sandbox created', sandbox.sandboxId)

  const result = await sandbox.commands.run('ls -al')
  console.log('Command result', result)

  await new Promise(resolve => setTimeout(resolve, 90000));

  const isRunning = await sandbox.isRunning()
  console.log('Sandbox is running', isRunning)

  await sandbox.kill()
  ```

  ```python Python icon="python" theme={"system"}
  from novita_sandbox.core import Sandbox
  import time

  sandbox = Sandbox.create(
      metadata={"idle_timeout": "60"}  # Minimum time is 60s, you can customize it
  )
  print('Sandbox created', sandbox.sandbox_id)

  result = sandbox.commands.run('ls -al')
  print('Command result', result)

  print('Waiting for 90 seconds...')
  time.sleep(90)

  is_running = sandbox.is_running()
  print('Sandbox is running', is_running)

  sandbox.kill()
  ```
</CodeGroup>
