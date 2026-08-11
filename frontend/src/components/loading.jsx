import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading({
  title = "Loading",
  description = "Please wait while we load the content for you.",
}) {
  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
        <Card className="w-full">
          {/* Loading title & description */}
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary sm:text-6xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          {/* Fluid Skeleton Block */}
          <CardContent>
            <div className="h-52 animate-pulse rounded-2xl border bg-muted/50" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
