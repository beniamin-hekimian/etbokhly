import Link from "next/link";
import Head from "next/head";
import { useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import useChef from "@/hooks/useChef";
import MealTagSelector from "@/components/chef/meal-tag-selector";
import MealImageUploader from "@/components/chef/meal-image-uploader";

export default function ChefMealCreatePage() {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      photo: "",
      tags: [],
    },
  });

  const selectedTags =
    useWatch({
      control,
      name: "tags",
    }) ?? [];

  const {
    authLoading,
    isAuthenticated,
    tags,
    tagsLoading,
    tagsError,
    imagePreview,
    isUploadingImage,
    isSubmitting,
    submitError,
    toggleTag,
    handleImageChange,
    submitMeal,
  } = useChef({
    setValue,
    reset,
    selectedTags,
    mode: "create",
  });

  if (authLoading || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{t.chef.createMeal.metaTitle}</title>
      </Head>

      <div className="min-h-screen bg-muted/20 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {t.chef.createMeal.title}
              </CardTitle>

              <CardDescription className="text-muted-foreground text-sm max-w-md mx-auto">
                {t.chef.createMeal.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form id="create-meal-form" onSubmit={handleSubmit(submitMeal)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      {t.chef.createMeal.nameLabel}
                    </Label>

                    <Input
                      id="name"
                      type="text"
                      placeholder={t.chef.createMeal.namePlaceholder}
                      {...register("name", {
                        required: t.chef.createMeal.errors.nameRequired,
                        minLength: {
                          value: 3,
                          message: t.chef.createMeal.errors.nameMin,
                        },
                      })}
                    />

                    {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      {t.chef.createMeal.descriptionLabel}
                    </Label>

                    <Textarea
                      id="description"
                      rows={5}
                      placeholder={t.chef.createMeal.descriptionPlaceholder}
                      {...register("description", {
                        required: t.chef.createMeal.errors.descriptionRequired,
                        minLength: {
                          value: 20,
                          message: t.chef.createMeal.errors.descriptionMin,
                        },
                      })}
                    />

                    {errors.description && (
                      <p className="text-xs font-medium text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      {t.chef.createMeal.priceLabel}
                    </Label>

                    <Input
                      id="price"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      placeholder={t.chef.createMeal.pricePlaceholder}
                      {...register("price", {
                        required: t.chef.createMeal.errors.priceRequired,
                        validate: (value) => {
                          const parsed = Number(value);

                          return (Number.isFinite(parsed) && parsed > 0) || t.chef.createMeal.errors.priceInvalid;
                        },
                      })}
                    />

                    {errors.price && <p className="text-xs font-medium text-destructive">{errors.price.message}</p>}
                  </div>

                  {/* Image Uploader */}
                  <MealImageUploader
                    register={register}
                    errors={errors}
                    handleImageChange={handleImageChange}
                    isUploadingImage={isUploadingImage}
                    imagePreview={imagePreview}
                  />

                  {/* Tag Selector */}
                  <MealTagSelector
                    register={register}
                    errors={errors}
                    tags={tags}
                    tagsLoading={tagsLoading}
                    tagsError={tagsError}
                    selectedTags={selectedTags}
                    toggleTag={toggleTag}
                  />
                </div>

                {submitError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                    {submitError}
                  </div>
                )}
              </form>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-3 pt-2">
              <Link href="/meals">
                <Button variant="outline" type="button">
                  {t.chef.createMeal.cancel}
                </Button>
              </Link>

              <Button type="submit" form="create-meal-form" disabled={isSubmitting || isUploadingImage}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.chef.createMeal.submitButton}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
