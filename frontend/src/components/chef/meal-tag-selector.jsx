import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

export default function MealTagSelector({ register, errors, tags, tagsLoading, tagsError, selectedTags, toggleTag }) {
  const { t } = useTranslation();

  const selectedTagCountLabel = `${selectedTags.length} ${t.chef.tagSelector.selectedCount}`;

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-sm font-medium text-foreground">{t.chef.tagSelector.label}</Label>

        <p className="text-xs text-muted-foreground">{selectedTagCountLabel}</p>
      </div>

      <input
        type="hidden"
        {...register("tags", {
          validate: (value) => {
            const count = value?.length ?? 0;

            return (count >= 1 && count <= 3) || t.chef.tagSelector.validationError;
          },
        })}
      />

      {tagsLoading ? (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs font-medium text-muted-foreground">
          {t.chef.tagSelector.loading}
        </div>
      ) : tagsError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          {t.chef.tagSelector.error}
        </div>
      ) : tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);

            return (
              <Button
                key={tag.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTag(tag.id)}
                className="capitalize text-xs"
              >
                {tag.name.replace("-", " ")}
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs font-medium text-muted-foreground">
          {t.chef.tagSelector.noTags}
        </div>
      )}

      {errors.tags && <p className="text-xs font-medium text-destructive">{errors.tags.message}</p>}
    </div>
  );
}
