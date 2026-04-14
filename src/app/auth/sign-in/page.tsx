import { SignInCard } from './sign-in-card'

export default function SignIn() {
  return (
    <div className="flex size-full min-h-screen">
      <div className="flex w-full flex-1 bg-[url('/bg-sign-in.jpeg')] bg-cover blur-sm" />

      <main className="flex h-auto w-full max-w-lg items-center justify-center p-4">
        <SignInCard />
      </main>
    </div>
  )
}
