import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PlaygroundClient from './playground-client'
import type { App } from '@/types'

interface PlaygroundPageProps {
  params: Promise<{ id: string }>
}

export default async function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { id } = await params
  
  // 如果 id 是 'new'，则创建新的 playground
  if (id === 'new') {
    return <PlaygroundClient />
  }

  // 否则尝试加载已有的 app
  const adminClient = await createAdminClient()
  
  const { data: app, error } = await adminClient
    .from('apps')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !app) {
    notFound()
  }

  return <PlaygroundClient initialApp={app as App} appId={id} />
}
