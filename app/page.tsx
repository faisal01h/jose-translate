import Link from "next/link";
import { Translator } from "@/components/Translator";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f0f4f9]">
      <header className="sticky top-0 z-10 shrink-0 border-b border-[#dadce0] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a73e8] text-sm font-bold text-white">
              J
            </div>
            <div>
              <p className="text-base font-medium text-[#3c4043] sm:text-lg">
                José Translate
              </p>
              <p className="hidden text-xs text-[#5f6368] sm:block">
                Language translator
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] sm:px-4"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <Translator />
    </div>);
}
