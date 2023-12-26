import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <h2 className="h2 border-b-0 p-0 mb-1">Not Found</h2>
      <p className="mb-5">Could not find requested resource.</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
