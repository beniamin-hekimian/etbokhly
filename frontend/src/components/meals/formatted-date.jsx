import { Calendar } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function FormattedDate({ date }) {
  const { isRTL } = useTranslation();

  if (!date) return null;

  const locale = isRTL ? "ar-EG" : "en-US";
  const prefix = isRTL ? "تمت الإضافة في" : "Added on";

  const formattedDate = new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-2 border-t border-border/60 pt-2 text-xs text-muted-foreground">
      <Calendar className="h-3.5 w-3.5 shrink-0" />
      <span>
        {prefix} {formattedDate}
      </span>
    </div>
  );
}
