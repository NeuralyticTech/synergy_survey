import { redirect } from 'next/navigation'

export default async function StartPage() {
  redirect('/')
}

export function generateStaticParams() {
  return [{ company: 'portal' }, { company: 'synergy' }]
}

