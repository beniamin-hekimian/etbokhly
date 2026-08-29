import Image from "next/image";
import Link from "next/link";
import { Ban, ChefHat, MapPin, Phone, StickyNote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";

const STATUS_VARIANTS = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  delivered: "bg-green-100 text-green-700",
};

export default function OrderCard({ order, showChef = true, showCustomer = false, actions = null, detailHref = null }) {
  const { t } = useTranslation();
  const statusKey = order.status || "pending";

  return (
    <Card className="py-0 overflow-hidden border-border bg-card shadow-sm">
      {/* Header */}
      <CardHeader className="border-b border-border/60 bg-muted/40 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {showChef && (
              <>
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
              </>
            )}
            {showCustomer && (
              <>
                <Avatar className="h-11 w-11 border border-border">
                  <AvatarImage src={order.user?.profile_image} alt={order.user?.full_name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <ChefHat className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-foreground">{order.user?.full_name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {order.user?.location && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{order.user.location}</span>
                      </p>
                    )}
                    {order.user?.phone && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{order.user.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <Badge className={`text-[0.7rem] font-bold ${STATUS_VARIANTS[statusKey] || ""}`}>
            {t.orders?.status?.[statusKey] || statusKey}
          </Badge>
        </div>
      </CardHeader>

      {/* Order Note */}
      {order.note && (
        <div className="flex items-start gap-2.5 border-b border-border/60 bg-primary/5 px-5 py-3.5">
          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-foreground">
              {showCustomer ? t.orders?.customerNote : t.orders?.note}
            </span>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-muted-foreground">{order.note}</p>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {order.status === "rejected" && order.rejectionReason && (
        <div className="flex items-start gap-2.5 border-b border-border/60 bg-destructive/5 px-5 py-3.5">
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-destructive">{t.orders?.rejectionReason}</span>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-destructive/80">{order.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <CardContent className="divide-y divide-border/60 p-0">
        {order.items?.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 sm:p-5">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={item.meal?.photo || "/placeholder.webp"}
                alt={item.mealName}
                fill
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
                  {item.price} {t.latestMeals?.priceLabel} x {item.quantity}
                </p>
              </div>

              <span className="font-extrabold text-sm text-foreground">
                {Number(item.price) * item.quantity} {t.latestMeals?.priceLabel}
              </span>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground">
            {order.total} {t.latestMeals?.priceLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {order.items?.length} {t.orders?.itemsCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          <Link
            href={detailHref || `/orders/${order.id}`}
            className="text-xs font-bold text-primary hover:underline"
          >
            {t.orders?.viewDetails}
          </Link>
        </div>
      </div>
    </Card>
  );
}
