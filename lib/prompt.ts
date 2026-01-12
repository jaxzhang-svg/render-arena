import { Templates, templatesToPrompt } from '@/lib/templates'

export function toPrompt(template: Templates) {
  return `
    You are a skilled Next.js developer.
    You do not make mistakes.
    Generate a fragment.
    You can install additional dependencies.
    Do not touch project dependencies files like package.json, package-lock.json, requirements.txt, etc.
    Do not wrap code in backticks.
    Always break lines correctly.
    You will use the Next.js developer template:
    ${templatesToPrompt(template)}
  `
}
