import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

export default function ChefSidebar({ user }) {
  const { t } = useTranslation();
  const chefAvatarSrc = user?.profile_image?.trim() ? user.profile_image : "/avatar.webp";

  return (
    <div className="space-y-6">
      <Card className="sticky top-6 border border-border/60 bg-card py-0 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <h3 className="border-b border-border/60 pb-3 text-lg font-bold text-foreground">
            {t.meals.details.chefSidebar.header}
          </h3>

          {/* Chef Bio */}
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              <Image
                src={chefAvatarSrc}
                alt={`${user?.full_name || t.meals.details.chefSidebar.unknownChef} avatar`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {user?.full_name || t.meals.details.chefSidebar.unknownChef}
              </p>
              <p className="text-xs text-muted-foreground">{t.meals.details.chefSidebar.badge}</p>
            </div>
          </div>

          {/* Chef Contact Details */}
          <div className="space-y-3.5 pt-2 text-sm text-muted-foreground">
            {user?.location && (
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="capitalize">{user.location}</span>
              </div>
            )}

            {user?.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${user.phone}`} className="transition-colors hover:text-foreground hover:underline">
                  {user.phone}
                </a>
              </div>
            )}

            {user?.email && (
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href={`mailto:${user.email}`}
                  className="truncate transition-colors hover:text-foreground hover:underline"
                >
                  {user.email}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
