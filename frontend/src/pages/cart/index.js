import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ShoppingBag, MapPin, Phone, ChefHat, ArrowRight, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import Loading from "@/components/loading";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/hooks/useCart";
import { Reveal } from "@/components/reveal";

export default function CartPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { cartData, cartTotal, fetchCart, updateItemQuantity, removeCartItem, loading } = useCart();
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (orderId, itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItemId(itemId);
    await updateItemQuantity(orderId, itemId, newQuantity);
    setUpdatingItemId(null);
  };

  const handleRemoveItem = async (orderId, itemId) => {
    setRemovingItemId(itemId);
    await removeCartItem(orderId, itemId);
    setRemovingItemId(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (!cartData || cartData.length === 0) {
    return (
      <>
        <Head>
          <title>{t.cart?.metaTitle}</title>
        </Head>
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-md px-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{t.cart?.emptyTitle}</h1>
            <p className="mt-3 text-muted-foreground">{t.cart?.emptyDescription}</p>
            <div className="mt-8">
              <Button asChild size="lg" className="font-bold">
                <Link href="/meals">{t.cart?.browseMeals}</Link>
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
        <title>{t.cart?.metaTitle}</title>
      </Head>
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            {/* Header */}
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="mb-2 inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                  {t.cart?.emptyTitle}
                </span>
                <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.cart?.title}</h1>
              </div>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link href="/meals" className="flex items-center gap-2 font-bold">
                  <ArrowRight className="h-4 w-4" />
                  {t.cart?.continueShopping}
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Orders List (Grouped by Chef) */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                {cartData.map((order) => (
                  <Card key={order.id} className="py-0 overflow-hidden border-border bg-card shadow-sm">
                    {/* Chef Info Header */}
                    <CardHeader className="border-b border-border/60 bg-muted/40 p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-4">
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
                              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{order.chef.location}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {order.chef?.phone && (
                          <a
                            href={`tel:${order.chef.phone}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
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
                              <Link
                                href={`/meals/${item.mealId}`}
                                className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                              >
                                {item.mealName}
                              </Link>
                              <p className="text-xs text-muted-foreground mt-1">
                                {t.cart?.perItemPrice}: {item.price} {t.latestMeals?.priceLabel}
                              </p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3">
                              <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-md"
                                  disabled={
                                    item.quantity <= 1 ||
                                    updatingItemId === item.id ||
                                    removingItemId === item.id
                                  }
                                  onClick={() => handleQuantityChange(order.id, item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </Button>
                                <span className="flex min-w-8 justify-center text-sm font-bold">
                                  {updatingItemId === item.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-md"
                                  disabled={updatingItemId === item.id || removingItemId === item.id}
                                  onClick={() => handleQuantityChange(order.id, item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                title={t.cart?.removeItem}
                                disabled={updatingItemId === item.id || removingItemId === item.id}
                                onClick={() => handleRemoveItem(order.id, item.id)}
                              >
                                {removingItemId === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>

                              <span className="min-w-20 text-right font-extrabold text-foreground">
                                {Number(item.price) * item.quantity} {t.latestMeals?.priceLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>

                    {/* Order Card Footer */}
                    <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-3.5">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {t.cart?.chefTotalPrefix} {order.chef?.full_name}
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
                    <CardTitle className="text-lg font-bold">{t.cart?.orderSummary}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.cart?.ordersByChefsCount}</span>
                      <span className="font-bold text-foreground">{cartData.length}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-base">
                      <span className="font-extrabold text-foreground">{t.cart?.totalLabel}</span>
                      <span className="text-xl font-extrabold text-primary">
                        {cartTotal} {t.latestMeals?.priceLabel}
                      </span>
                    </div>

                    <Button
                      className="w-full font-bold shadow-xs mt-2"
                      size="lg"
                      onClick={() => router.push("/checkout")}
                    >
                      {t.cart?.completeOrder}
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
