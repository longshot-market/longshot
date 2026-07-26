import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import Wordmark from "@/components/Wordmark";
import ThemeToggle from "@/components/ThemeToggle";
import AuthButtons from "@/components/auth/AuthButtons";

/** Shared top header: wordmark + compact search + auth control + theme toggle. */
export default function AppHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Link href="/" className="shrink-0 sm:flex-1">
        <Wordmark className="h-[53px]" />
      </Link>
      <div className="w-full sm:max-w-md">
        <SearchBox compact />
      </div>
      <div className="flex items-center justify-end gap-2 sm:flex-1">
        <AuthButtons />
        <ThemeToggle />
      </div>
    </header>
  );
}
