import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

export default function MealImageUploader({ register, errors, handleImageChange, isUploadingImage, imagePreview }) {
  const { t } = useTranslation();

  return (
    <>
      {/* Image Upload Input */}
      <div className="space-y-2">
        <Label htmlFor="photoFile" className="text-sm font-medium text-foreground">
          {t.chef.imageUploader.label}
        </Label>

        <Input id="photoFile" type="file" accept="image/*" onChange={handleImageChange} disabled={isUploadingImage} />

        <input
          type="hidden"
          {...register("photo", {
            required: t.chef.imageUploader.requiredError,
          })}
        />

        {isUploadingImage && (
          <p className="text-xs font-medium text-muted-foreground">{t.chef.imageUploader.uploading}</p>
        )}

        <p className="text-xs text-muted-foreground">{t.chef.imageUploader.allowedTypes}</p>

        {errors.photo && <p className="text-xs font-medium text-destructive">{errors.photo.message}</p>}
      </div>

      {/* Image Preview Container */}
      <div className="md:col-span-2">
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-background text-muted-foreground">
              <Upload className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{t.chef.imageUploader.previewTitle}</p>

              <p className="text-xs text-muted-foreground">{t.chef.imageUploader.previewDescription}</p>

              {imagePreview ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-border bg-background">
                  <div
                    className="h-56 w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${imagePreview})`,
                    }}
                    role="img"
                    aria-label="Meal preview"
                  />
                </div>
              ) : (
                <div className="mt-3 flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-background text-xs font-medium text-muted-foreground">
                  {t.chef.imageUploader.noImage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
