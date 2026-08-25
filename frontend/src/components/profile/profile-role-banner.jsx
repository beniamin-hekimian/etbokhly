import { ChefHat, ShieldCheck, UserCheck } from "lucide-react";
import { useRouter } from "next/router";

const ROLE_CONFIGS = {
  CHEF: {
    title: { en: "Chef Workspace", ar: "مساحة عمل الطاهي" },
    description: {
      en: "Manage your homemade dishes, culinary profile, and incoming orders.",
      ar: "إدارة وجباتك المنزلية، ملفك الطهي، والطلبات الواردة.",
    },
    icon: ChefHat,
    container: "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/20 dark:border-emerald-500/40",
    badge: "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
    iconWrapper: "bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  },
  ADMIN: {
    title: { en: "Admin Portal", ar: "بوابة المسؤول" },
    description: {
      en: "Full system access to oversee users, chef requests, and platform activity.",
      ar: "صلاحيات كاملة لمتابعة المستخدمين، طلبات الطهاة، ونشاط المنصة.",
    },
    icon: ShieldCheck,
    container: "bg-amber-500/15 border-amber-500/40 dark:bg-amber-500/20 dark:border-amber-500/50",
    badge: "bg-amber-500/25 border-amber-500/50 text-amber-800 dark:text-amber-200",
    iconWrapper: "bg-amber-500/25 border-amber-500/50 text-amber-600 dark:text-amber-400",
  },
  CUSTOMER: {
    title: { en: "Customer Dashboard", ar: "لوحة تحكم العميل" },
    description: {
      en: "Browse fresh homemade meals, track orders, and manage account details.",
      ar: "تصفح الوجبات المنزلية الطازجة، تتبع الطلبات، وإدارة تفاصيل حسابك.",
    },
    icon: UserCheck,
    container: "bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/20 dark:border-blue-500/40",
    badge: "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300",
    iconWrapper: "bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400",
  },
};

export default function ProfileRoleBanner({ role }) {
  const { locale } = useRouter();
  const lang = locale === "ar" ? "ar" : "en";

  const normalizedRole = role?.toUpperCase() || "CUSTOMER";
  const config = ROLE_CONFIGS[normalizedRole] || ROLE_CONFIGS.CUSTOMER;
  const Icon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 sm:p-5 shadow-xs transition-colors ${config.container}`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${config.iconWrapper}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-lg font-extrabold text-foreground sm:text-xl">{config.title[lang]}</h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${config.badge}`}
            >
              {normalizedRole}
            </span>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">{config.description[lang]}</p>
        </div>
      </div>
    </div>
  );
}
