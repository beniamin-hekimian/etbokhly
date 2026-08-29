import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import Loading from "@/components/loading";
import OrderCard from "@/components/orders/order-card";
import RejectOrderDialog from "@/components/orders/reject-order-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useChefOrders, useChefCurrentOrders, useChefPreviousOrders, useChefOrderActions } from "@/hooks/useOrder";
import { Reveal } from "@/components/reveal";

const TABS = ["all", "current", "previous"];

export default function ChefOrdersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");

  const allOrders = useChefOrders();
  const currentOrders = useChefCurrentOrders();
  const previousOrders = useChefPreviousOrders();
  const { actionLoading, acceptOrder, rejectOrder, deliverOrder } = useChefOrderActions();
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const hooks = {
    all: allOrders,
    current: currentOrders,
    previous: previousOrders,
  };

  const { orders, loading, fetchOrders } = hooks[activeTab];

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleAction(action, orderId) {
    let result = null;

    if (action === "accept") {
      result = await acceptOrder(orderId);
    } else if (action === "deliver") {
      result = await deliverOrder(orderId);
    }

    if (result) {
      fetchOrders();
    }
  }

  async function handleConfirmReject() {
    if (!rejectTarget) return;

    const result = await rejectOrder(rejectTarget.id, rejectReason);

    if (result) {
      setRejectDialogOpen(false);
      setRejectReason("");
      setRejectTarget(null);
      fetchOrders();
    }
  }

  const tabLabels = {
    all: t.chefOrders?.allTab,
    current: t.chefOrders?.currentTab,
    previous: t.chefOrders?.previousTab,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{t.chefOrders?.metaTitle}</title>
      </Head>
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.chefOrders?.title}</h1>
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
                    <h3 className="font-bold text-foreground">{t.chefOrders?.emptyTitle}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.chefOrders?.emptyDescription}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    showChef={false}
                    showCustomer
                    detailHref={`/chef/orders/${order.id}`}
                    actions={
                      order.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700 text-xs font-bold"
                            onClick={() => handleAction("accept", order.id)}
                            disabled={actionLoading}
                          >
                            {t.chefOrders?.accept}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs font-bold"
                            onClick={() => {
                              setRejectTarget(order);
                              setRejectReason("");
                              setRejectDialogOpen(true);
                            }}
                            disabled={actionLoading}
                          >
                            {t.chefOrders?.reject}
                          </Button>
                        </>
                      ) : order.status === "accepted" ? (
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold"
                          onClick={() => handleAction("deliver", order.id)}
                          disabled={actionLoading}
                        >
                          {t.chefOrders?.deliver}
                        </Button>
                      ) : null
                    }
                  />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <RejectOrderDialog
        open={rejectDialogOpen}
        onOpenChange={(val) => {
          setRejectDialogOpen(val);
          if (!val && !actionLoading) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
        order={rejectTarget}
        reason={rejectReason}
        setReason={setRejectReason}
        actionLoading={actionLoading}
        onConfirm={handleConfirmReject}
      />
    </>
  );
}
