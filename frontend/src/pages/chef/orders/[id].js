import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { ArrowRight, Ban, MapPin, Phone, User, StickyNote } from "lucide-react";
import Loading from "@/components/loading";
import RejectOrderDialog from "@/components/orders/reject-order-dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { useOrderDetail, useChefOrderActions } from "@/hooks/useOrder";
import { Reveal } from "@/components/reveal";

const STATUS_VARIANTS = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  delivered: "bg-green-100 text-green-700",
};

export default function ChefOrderDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { order, loading, error, fetchOrder } = useOrderDetail(id);
  const { actionLoading, acceptOrder, rejectOrder, deliverOrder } = useChefOrderActions();
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function handleAction(action) {
    let result = null;

    if (action === "accept") {
      result = await acceptOrder(order.id);
    } else if (action === "deliver") {
      result = await deliverOrder(order.id);
    }

    if (result) {
      fetchOrder();
    }
  }

  async function handleConfirmReject() {
    if (!order) return;

    const result = await rejectOrder(order.id, rejectReason);

    if (result) {
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchOrder();
    }
  }

  if (loading || !id) {
    return <Loading />;
  }

  if (error || !order) {
    return (
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-md px-6 text-center">
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{t.chefOrders?.detail?.title}</h1>
          <p className="mt-3 text-muted-foreground">{error || t.chefOrders?.emptyTitle}</p>
          <div className="mt-8">
            <Link href="/chef/orders">
              <Button size="lg" className="font-bold">{t.chefOrders?.detail?.backToOrders}</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const statusKey = order.status || "pending";

  return (
    <>
      <Head>
        <title>{t.chefOrders?.detail?.metaTitle}</title>
      </Head>
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.chefOrders?.detail?.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t.chefOrders?.orderId}{order.id?.slice(0, 8)}</p>
              </div>
              <Link href="/chef/orders">
                <Button variant="outline" size="sm" className="w-fit">
                  <ArrowRight className="h-4 w-4" />
                  {t.chefOrders?.detail?.backToOrders}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Order Info + Items */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                {/* Order Info */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold">{t.chefOrders?.detail?.orderInfo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t.chefOrders?.detail?.status}</span>
                        <div className="mt-1">
                          <Badge className={`text-xs font-bold ${STATUS_VARIANTS[statusKey] || ""}`}>
                            {t.chefOrders?.status?.[statusKey] || statusKey}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t.chefOrders?.detail?.date}</span>
                        <p className="mt-1 font-bold text-foreground">
                          {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Note */}
                {order.note && (
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <StickyNote className="h-5 w-5 text-primary" />
                        {t.chefOrders?.detail?.customerNote}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{order.note}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Rejection Reason */}
                {order.status === "rejected" && order.rejectionReason && (
                  <Card className="border-destructive/30 bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <Ban className="h-5 w-5 text-destructive" />
                        {t.chefOrders?.detail?.rejectionReason}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap leading-relaxed text-destructive/80">{order.rejectionReason}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Items */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold">{t.chefOrders?.detail?.items}</CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-border/60 p-0">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 sm:p-5">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.meal?.photo || "/placeholder.webp"}
                            alt={item.mealName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div>
                            <Link
                              href={`/meals/${item.mealId}`}
                              className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.mealName}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t.chefOrders?.detail?.priceEach}: {item.price} {t.latestMeals?.priceLabel}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                              {t.chefOrders?.detail?.quantity}: {item.quantity}
                            </span>
                            <span className="font-extrabold text-sm text-foreground">
                              {Number(item.price) * item.quantity} {t.latestMeals?.priceLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-6 lg:col-span-1">
                {/* Total */}
                <Card className="border-border bg-card shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-foreground">{t.chefOrders?.detail?.total}</span>
                      <span className="text-xl font-extrabold text-primary">
                        {order.total} {t.latestMeals?.priceLabel}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Info */}
                {order.user && (
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold">{t.chefOrders?.detail?.customerInfo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-border">
                          <AvatarImage src={order.user.profile_image} alt={order.user.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground">{order.user.full_name}</p>
                          {order.user.location && (
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {order.user.location}
                            </p>
                          )}
                        </div>
                      </div>
                      {order.user.phone && (
                        <a
                          href={`tel:${order.user.phone}`}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                        >
                          <Phone className="h-4 w-4" />
                          {order.user.phone}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card className="border-border bg-card shadow-sm">
                  <CardContent className="pt-6">
                    {order.status === "pending" && (
                      <div className="flex flex-col gap-3">
                        <Button
                          className="w-full bg-green-600 text-white hover:bg-green-700 font-bold"
                          onClick={() => handleAction("accept")}
                          disabled={actionLoading}
                        >
                          {t.chefOrders?.detail?.accept}
                        </Button>
                        <Button
                          className="w-full font-bold"
                          variant="destructive"
                          onClick={() => {
                            setRejectReason("");
                            setRejectDialogOpen(true);
                          }}
                          disabled={actionLoading}
                        >
                          {t.chefOrders?.detail?.reject}
                        </Button>
                      </div>
                    )}
                    {order.status === "accepted" && (
                      <Button
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold"
                        onClick={() => handleAction("deliver")}
                        disabled={actionLoading}
                      >
                        {t.chefOrders?.detail?.deliver}
                      </Button>
                    )}
                    {(order.status === "rejected" || order.status === "delivered") && (
                      <p className="text-center text-sm text-muted-foreground">
                        {t.chefOrders?.status?.[order.status]}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <RejectOrderDialog
        open={rejectDialogOpen}
        onOpenChange={(val) => {
          setRejectDialogOpen(val);
          if (!val && !actionLoading) {
            setRejectReason("");
          }
        }}
        order={order}
        reason={rejectReason}
        setReason={setRejectReason}
        actionLoading={actionLoading}
        onConfirm={handleConfirmReject}
      />
    </>
  );
}
