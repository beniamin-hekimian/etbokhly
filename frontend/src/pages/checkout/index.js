import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ShoppingBag, ChefHat, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Loading from "@/components/loading";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/hooks/useCart";
import { Reveal } from "@/components/reveal";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { checkoutData, checkoutTotal, fetchCheckoutSummary, checkout, loading, error } = useCart();
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    fetchCheckoutSummary();
  }, [fetchCheckoutSummary]);

  async function handleConfirmOrder() {
    setIsConfirming(true);
    const result = await checkout();
    setIsConfirming(false);

    if (result) {
      setOrderConfirmed(true);
    }
  }

  if (loading && !orderConfirmed) {
    return <Loading />;
  }

  if (orderConfirmed) {
    return (
      <>
        <Head>
          <title>{t.checkout?.metaTitle}</title>
        </Head>
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-md px-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{t.checkout?.orderConfirmed}</h1>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="font-bold">
                <Link href="/orders">{t.checkout?.viewMyOrders}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-bold">
                <Link href="/meals">{t.checkout?.continueShopping}</Link>
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!checkoutData || checkoutData.length === 0) {
    return (
      <>
        <Head>
          <title>{t.checkout?.metaTitle}</title>
        </Head>
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-md px-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{t.checkout?.emptyTitle}</h1>
            <p className="mt-3 text-muted-foreground">{t.checkout?.emptyDescription}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="font-bold">
                <Link href="/cart">{t.checkout?.backToCart}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-bold">
                <Link href="/meals">{t.checkout?.continueShopping}</Link>
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t.checkout?.metaTitle}</title>
      </Head>
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            {/* Header */}
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="mb-2 inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                  {t.checkout?.title}
                </span>
                <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.checkout?.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{t.checkout?.description}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link href="/cart" className="flex items-center gap-2 font-bold">
                  <ArrowRight className="h-4 w-4" />
                  {t.checkout?.backToCart}
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Orders List (Grouped by Chef) */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                {checkoutData.map((order) => (
                  <Card key={order.id} className="py-0 overflow-hidden border-border bg-card shadow-sm">
                    {/* Chef Info Header */}
                    <CardHeader className="border-b border-border/60 bg-muted/40 p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border border-border">
                          <AvatarImage src={order.chef?.profile_image} alt={order.chef?.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <ChefHat className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-bold text-foreground">{order.chef?.full_name}</h2>
                          {order.chef?.location && (
                            <p className="text-xs text-muted-foreground mt-0.5">{order.chef.location}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {/* Order Items */}
                    <CardContent className="divide-y divide-border/60 p-0">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 sm:p-5">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={item.meal?.photo || "/placeholder.webp"}
                              alt={item.mealName}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="font-bold text-foreground line-clamp-1">{item.mealName}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {t.checkout?.perItemPrice}: {Number(item.meal?.price) || item.price} {t.latestMeals?.priceLabel}
                              </p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6">
                              <span className="text-xs font-semibold rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                                {t.checkout?.quantityLabel}: {item.quantity}
                              </span>
                              <span className="font-extrabold text-foreground">
                                {Number(item.meal?.price || item.price) * item.quantity} {t.latestMeals?.priceLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>

                    {/* Order Card Footer */}
                    <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-3.5">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {t.checkout?.chefTotalPrefix} {order.chef?.full_name}
                      </span>
                      <span className="text-base font-extrabold text-primary">
                        {order.total} {t.latestMeals?.priceLabel}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Total Summary Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-border bg-card shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold">{t.checkout?.ordersSummary}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.checkout?.itemCount}</span>
                      <span className="font-bold text-foreground">{checkoutData.length}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-base">
                      <span className="font-extrabold text-foreground">{t.checkout?.totalLabel}</span>
                      <span className="text-xl font-extrabold text-primary">
                        {checkoutTotal} {t.latestMeals?.priceLabel}
                      </span>
                    </div>

                    <Button
                      className="w-full font-bold shadow-xs mt-2"
                      size="lg"
                      onClick={handleConfirmOrder}
                      disabled={isConfirming}
                    >
                      {isConfirming ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t.checkout?.confirmingOrder}
                        </span>
                      ) : (
                        t.checkout?.confirmOrder
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
