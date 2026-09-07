export function Nav() {
  return (
    <header className="mx-auto w-full max-w-3xl px-6 pt-8">
      <nav className="glass sweep flex items-center justify-between px-6 py-3">
        <span className="font-semibold tracking-tight">soroban-ttl-doctor</span>
        <a
          href="https://github.com/soroban-doc-ttl"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}
