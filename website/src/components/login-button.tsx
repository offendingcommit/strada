"use client"

import { useState, type FormEvent } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { authClient } from "../auth-client.ts"

export function LoginButton({ callbackURL = "/wip" }: { callbackURL?: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        setError("Invalid email or password")
        return
      }
      window.location.assign(callbackURL)
    } catch {
      setError("Sign in failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} className="w-full space-y-4">
      <label className="block text-sm font-medium" htmlFor="strada-email">Email</label>
      <Input id="strada-email" type="email" autoComplete="username" required
        value={email} onChange={(event) => setEmail(event.target.value)} />
      <label className="block text-sm font-medium" htmlFor="strada-password">Password</label>
      <Input id="strada-password" type="password" autoComplete="current-password" required
        value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" loading={loading} size="lg" className="w-full">Sign in</Button>
    </form>
  )
}
