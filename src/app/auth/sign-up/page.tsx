import { SignUpCard } from './sign-up-card'

export default function SignUp() {
  return (
    <div className="flex size-full min-h-screen">
      <main className="flex h-auto w-full max-w-lg items-center justify-center p-4">
        <SignUpCard />
      </main>

      <div className="flex w-full flex-1 bg-[url('/bg-sign-up.jpeg')] bg-cover blur-sm" />
    </div>
  )
}
