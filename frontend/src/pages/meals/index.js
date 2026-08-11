import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MealsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 border-b border-border pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-6xl md:text-7xl font-bold tracking-wide text-foreground leading-none">
              Freshly Made Kitchen Discoveries
            </h1>

            <p className="font-sans text-muted-foreground mt-3 text-base md:text-lg">
              Order authentic, home-cooked delicacies crafted dynamically by
              verified neighborhood chefs.
            </p>
          </div>

          <Link href="/chef/meals/create">
            <Button>Create Meal</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
