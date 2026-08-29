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

export default function NoteDialog({ open, onOpenChange, note, setNote, confirming, onConfirm }) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(val) => !confirming && onOpenChange(val)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.checkout.noteDialog.title}</DialogTitle>
          <DialogDescription>{t.checkout.noteDialog.description}</DialogDescription>
        </DialogHeader>

        <Textarea
          id="order-note"
          placeholder={t.checkout.noteDialog.placeholder}
          value={note}
          maxLength={2000}
          onChange={(e) => setNote(e.target.value)}
          disabled={confirming}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>
            {t.checkout.noteDialog.cancel}
          </Button>

          <Button type="button" onClick={onConfirm} disabled={confirming}>
            {confirming ? t.checkout.noteDialog.confirming : t.checkout.noteDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}