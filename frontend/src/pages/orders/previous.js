import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import Loading from "@/components/loading";
import OrderCard from "@/components/orders/order-card";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useMyPreviousOrders } from "@/hooks/useOrder";
import { Reveal } from "@/components/reveal";

export default function MyPreviousOrdersPage() {
  const { t } = useTranslation();
  const { orders, loading, fetchOrders } = useMyPreviousOrders();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{t.orders?.previousTab} | {t.orders?.metaTitle}</title>
      </Head>
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.orders?.previousTab}</h1>
            </div>

            {/* Orders List */}
            {!orders || orders.length === 0 ? (
              <Card className="border-border/60 bg-card shadow-sm">
                <CardContent className="flex min-h-60 flex-col items-center justify-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-foreground">{t.orders?.emptyTitle}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.orders?.emptyDescription}</p>
                  </div>
                  <Button asChild className="font-bold">
                    <Link href="/meals">{t.orders?.browseMeals}</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} showChef />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
