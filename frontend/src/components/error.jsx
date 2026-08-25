import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Reusable global error component across pages
export default function Error({
  title = "Something went wrong",
  message = "Could not load the requested details right now.",
  onRetry,
  retryText = "Retry Connection",
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-4xl text-secondary sm:text-5xl">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>

        {onRetry && (
          <CardContent className="flex justify-center pb-6">
            <Button variant="secondary" onClick={onRetry}>
              {retryText}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
