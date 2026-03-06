export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-8 px-8 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Tabworthy</h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          The best channels on the internet, picked by people who actually watch
          them.
        </p>
      </main>
    </div>
  );
}
