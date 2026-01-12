import { FragmentSchema } from '@/lib/schema'
import { ExecutionResultWeb } from '@/lib/types'
import { Sandbox } from 'novita-sandbox'

const sandboxTimeout = 10 * 60 * 1000

export const maxDuration = 60

export async function POST(req: Request) {
  const {
    fragment,
  }: {
    fragment: FragmentSchema
  } = await req.json()

  console.log('fragment', fragment)

  const sbx = await Sandbox.create(fragment.template, {
    metadata: {
      template: fragment.template,
    },
    timeoutMs: sandboxTimeout,
  })

  if (fragment.has_additional_dependencies) {
    await sbx.commands.run(fragment.install_dependencies_command)
    console.log(
      `Installed dependencies: ${fragment.additional_dependencies.join(', ')} in sandbox ${sbx.sandboxId}`,
    )
  }

  await sbx.files.write(fragment.file_path, fragment.code)
  console.log(`Copied file to ${fragment.file_path} in ${sbx.sandboxId}`)

  return new Response(
    JSON.stringify({
      sbxId: sbx?.sandboxId,
      template: fragment.template,
      url: `https://${sbx?.getHost(fragment.port || 80)}`,
    } as ExecutionResultWeb),
  )
}
