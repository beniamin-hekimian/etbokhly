import Head from "next/head";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const errorMessages = [
  {
    code: 400,
    title: "Bad Request",
    message: "The request could not be understood by the server.",
  },
  {
    code: 401,
    title: "Unauthorized",
    message: "You need to sign in to access this resource.",
  },
  {
    code: 403,
    title: "Forbidden",
    message: "You do not have permission to access this resource.",
  },
  {
    code: 404,
    title: "Page Not Found",
    message: "The page you are looking for could not be found.",
  },
  {
    code: 408,
    title: "Request Timeout",
    message: "The request took too long to complete.",
  },
  {
    code: 429,
    title: "Too Many Requests",
    message: "Too many requests were sent. Please try again later.",
  },
  {
    code: 500,
    title: "Internal Server Error",
    message: "Something went wrong on our server.",
  },
  {
    code: 502,
    title: "Bad Gateway",
    message: "The server received an invalid response from another server.",
  },
  {
    code: 503,
    title: "Service Unavailable",
    message: "The server is temporarily unavailable.",
  },
  {
    code: 504,
    title: "Gateway Timeout",
    message: "The server did not receive a response in time.",
  },
];

const defaultError = {
  code: 500,
  title: "Application Error",
  message: "An unexpected error occurred.",
};

export default function Error({ statusCode }) {
  const error = errorMessages.find((error) => error.code === statusCode) || defaultError;

  return (
    <>
      <Head>
        <title>
          {error.code} {error.title} | Etbokhly
        </title>

        <meta name="description" content={error.message} />
      </Head>

      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-6xl text-secondary sm:text-7xl">{error.code}</CardTitle>

            <CardDescription className="text-base font-bold">{error.title}</CardDescription>
          </CardHeader>

          <CardContent className="text-center text-sm text-muted-foreground">{error.message}</CardContent>

          <CardFooter className="justify-center gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>

            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;

  return {
    statusCode,
  };
};
