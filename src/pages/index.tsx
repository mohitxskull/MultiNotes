import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to MultiNotes</h1>
      <p className="text-lg mb-8">The best way to manage your notes across multiple tenants.</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/auth/sign_in">Sign In</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/auth/sign_up">Sign Up</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="https://github.com/mohitxskull/MultiNotes" target="_blank">GitHub</Link>
        </Button>
      </div>
    </div>
  );
}