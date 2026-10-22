import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Small outlined "← label" button used at the top of detail pages to go one level up. */
export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Button variant="outline" size="sm" asChild className="w-fit max-w-full">
      <Link href={href}>
        <ArrowLeft data-icon="inline-start" aria-hidden />
        <span className="truncate">{label}</span>
      </Link>
    </Button>
  );
}
