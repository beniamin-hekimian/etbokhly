import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import Loading from "@/components/loading";
import OrderCard from "@/components/orders/order-card";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useMyOrders, useMyCurrentOrders, useMyPreviousOrders } from "@/hooks/useOrder";
import { Reveal } from "@/components/reveal";

const TABS = ["all", "current", "previous"];

export default function OrdersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");

  const allOrders = useMyOrders();
  const currentOrders = useMyCurrentOrders();
  const previousOrders = useMyPreviousOrders();

  const hooks = {
    all: allOrders,
    current: currentOrders,
    previous: previousOrders,
  };

  const { orders, loading, fetchOrders } = hooks[activeTab];

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const tabLabels = {
    all: t.orders?.allTab,
    current: t.orders?.currentTab,
    previous: t.orders?.previousTab,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{t.orders?.metaTitle}</title>
      </Head>
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.orders?.title}</h1>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
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
                  <Link href="/meals">
                    <Button className="font-bold">{t.orders?.browseMeals}</Button>
                  </Link>
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
