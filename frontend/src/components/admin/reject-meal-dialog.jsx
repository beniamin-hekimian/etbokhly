import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";

export default function RejectMealDialog({ open, onOpenChange, meal, reason, setReason, actionLoading, onConfirm }) {
  const { t } = useTranslation();

  const description = (t.admin.meals.rejectDialog.description || "").replace("{title}", meal?.title || "");

  return (
    <Dialog open={open} onOpenChange={(val) => !actionLoading && onOpenChange(val)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.admin.meals.rejectDialog.title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Input
          id="reject-reason"
          placeholder={t.admin.meals.rejectDialog.placeholder}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={actionLoading}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={actionLoading}>
            {t.admin.meals.rejectDialog.cancel}
          </Button>

          <Button type="button" variant="destructive" onClick={onConfirm} disabled={actionLoading || !reason.trim()}>
            {actionLoading ? t.admin.meals.rejectDialog.rejecting : t.admin.meals.rejectDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
