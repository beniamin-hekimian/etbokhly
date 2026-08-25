import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

const ROLE_BADGE_STYLES = {
  CHEF: "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold",
  ADMIN: "bg-amber-500/25 border-amber-500/50 text-amber-800 dark:text-amber-200 font-bold",
  CUSTOMER: "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300 font-bold",
};

export default function ProfileInfoCard({ profile }) {
  const { t } = useTranslation();

  const PROFILE_FIELDS = [
    { label: t.profile.fields.name, key: "full_name" },
    { label: t.profile.fields.phone, key: "phone" },
    { label: t.profile.fields.location, key: "location" },
    { label: t.profile.fields.bio, key: "bio" },
  ];

  const avatarSrc = profile?.profile_image?.trim() ? profile.profile_image : "/avatar.webp";

  const profileValueMap = {
    full_name: profile?.full_name,
    email: profile?.email,
    role: profile?.role,
    id: profile?.id,
    phone: profile?.phone ?? t.profile.notProvided,
    location: profile?.location ?? t.profile.notProvided,
    bio: profile?.bio ?? t.profile.noBio,
  };

  const roleBadgeClass = ROLE_BADGE_STYLES[profile?.role?.toUpperCase()] || ROLE_BADGE_STYLES.CUSTOMER;

  return (
    <Card className="overflow-hidden py-0 shadow-md border-border">
      <CardContent className="p-0">
        <div className="grid gap-0 md:grid-cols-[auto_1fr]">
          {/* Avatar & Key Identity Sidebar */}
          <div className="border-b bg-card p-6 md:border-b-0 md:border-r border-border">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border border-border bg-muted shadow-sm sm:h-32 sm:w-32">
                <Image
                  src={avatarSrc}
                  alt={`${profileValueMap.full_name} avatar`}
                  fill
                  priority
                  sizes="(max-width: 768px) 7rem, 8rem"
                  className="object-cover"
                />
              </div>

              <div className="space-y-1.5 text-center">
                <CardTitle className="font-sans text-xl font-extrabold text-foreground sm:text-2xl">
                  {profileValueMap.full_name}
                </CardTitle>

                <CardDescription className="text-sm text-muted-foreground">{profileValueMap.email}</CardDescription>

                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className={`cursor-default border opacity-100 font-semibold uppercase tracking-wide ${roleBadgeClass}`}
                >
                  {profileValueMap.role}
                </Button>
              </div>
            </div>
          </div>

          {/* User Profile Fields Grid */}
          <div className="p-6">
            <div className="grid h-full gap-4 sm:grid-cols-2">
              {PROFILE_FIELDS.map((field) => (
                <Card key={field.key} className="bg-background border-border shadow-xs">
                  <CardHeader className="p-4 pb-1">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 font-medium text-foreground text-base">
                    {profileValueMap[field.key]}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
