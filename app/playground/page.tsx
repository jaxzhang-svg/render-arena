import { redirect } from 'next/navigation'

/**
 * 重定向到新的 playground 页面
 * /playground -> /playground/new
 */
export default function PlaygroundRedirect() {
  redirect('/playground/new')
}
