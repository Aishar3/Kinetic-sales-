export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Kinetic Sales Platform</h1>
        <p className="mt-4 text-muted-foreground">The AI Sales Operating System</p>
        <a href="/auth/login" className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground">
          Get Started
        </a>
      </div>
    </div>
  )
}
