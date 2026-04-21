import { Link } from "wouter";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="mt-6 text-2xl font-bold" data-testid="text-forbidden-title">
        Not authorized
      </h2>
      <p className="mt-2 text-muted-foreground" data-testid="text-forbidden-message">
        You don't have permission to view this page. If you think this is a mistake,
        contact the site owner.
      </p>
      <Link href="/">
        <Button className="mt-6" data-testid="button-forbidden-home">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
