import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";

export default function RejectOrderDialog({ open, onOpenChange, order, reason, setReason, actionLoading, onConfirm }) {
  const { t } = useTranslation();

  const description = (t.chefOrders?.rejectDialog?.description || "").replace("{id}", order?.id?.slice(0, 8) || "");

  return (
    <Dialog open={open} onOpenChange={(val) => !actionLoading && onOpenChange(val)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.chefOrders?.rejectDialog?.title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Textarea
          id="order-rejection-reason"
          placeholder={t.chefOrders?.rejectDialog?.placeholder}
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
          disabled={actionLoading}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={actionLoading}>
            {t.chefOrders?.rejectDialog?.cancel}
          </Button>

          <Button type="button" variant="destructive" onClick={onConfirm} disabled={actionLoading || !reason.trim()}>
            {actionLoading ? t.chefOrders?.rejectDialog?.rejecting : t.chefOrders?.rejectDialog?.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}