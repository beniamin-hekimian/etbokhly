import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { Loader2, Upload } from "lucide-react";
import Loading from "@/components/loading";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useChefMealCreate from "@/hooks/useChefMealCreate";

export default function ChefMealCreatePage() {
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

  const selectedTagCountLabel = `${selectedTags.length} selected`;

  const {
    authLoading,
    isAuthenticated,
    tags,
    tagsLoading,
    tagsError,
    imagePreview,
    isUploadingImage,
    isCreatingMeal,
    createMealError,
    toggleTag,
    handleImageChange,
    submitMeal,
  } = useChefMealCreate({
    setValue,
    reset,
    selectedTags,
  });

  if (authLoading || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary sm:text-6xl">Create Meal</CardTitle>

            <CardDescription>
              Add a new dish, upload a photo, and tag it so customers can find it faster.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="create-meal-form" onSubmit={handleSubmit(submitMeal)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Name</Label>

                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter the meal name"
                    {...register("name", {
                      required: "Meal name is required",
                      minLength: {
                        value: 3,
                        message: "Minimum 3 characters",
                      },
                    })}
                  />

                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>

                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Describe the meal, its ingredients, and any other details"
                    {...register("description", {
                      required: "Meal description is required",
                      minLength: {
                        value: 20,
                        message: "Please add at least 20 characters",
                      },
                    })}
                  />

                  {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>

                  <Input
                    id="price"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter the meal price"
                    {...register("price", {
                      required: "Price is required",
                      validate: (value) => {
                        const parsed = Number(value);

                        return (Number.isFinite(parsed) && parsed > 0) || "Enter a valid price";
                      },
                    })}
                  />

                  {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoFile">Meal Image</Label>

                  <Input
                    id="photoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploadingImage}
                  />

                  <input
                    type="hidden"
                    {...register("photo", {
                      required: "Meal image is required",
                    })}
                  />

                  {isUploadingImage && <p className="text-sm text-muted-foreground">Uploading image...</p>}

                  <p className="text-xs text-muted-foreground">Allowed: JPG, PNG, WEBP, GIF. Max size: 5MB.</p>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <Label>Tags</Label>

                    <p className="text-sm text-muted-foreground">{selectedTagCountLabel}</p>
                  </div>

                  <input
                    type="hidden"
                    {...register("tags", {
                      validate: (value) => {
                        const count = value?.length ?? 0;

                        return (count >= 1 && count <= 3) || "Select between 1 and 3 tags";
                      },
                    })}
                  />

                  {tagsLoading ? (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                      Loading tags...
                    </div>
                  ) : tagsError ? (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-red-500">
                      Could not load tags right now.
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
                            className="capitalize"
                          >
                            {tag.name.replace("-", " ")}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                      No tags are available yet.
                    </div>
                  )}

                  {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-muted-foreground">
                        <Upload className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Image preview</p>

                        <p className="text-sm text-muted-foreground">
                          Your uploaded meal image will appear here once the upload is complete.
                        </p>

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
                          <div className="mt-3 flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground">
                            No image selected yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {createMealError && <p className="text-sm text-red-500">{createMealError}</p>}
            </form>
          </CardContent>

          <CardFooter className="justify-start gap-2">
            <Button variant="outline" asChild>
              <Link href="/meals">Cancel</Link>
            </Button>

            <Button type="submit" form="create-meal-form" disabled={isCreatingMeal || isUploadingImage}>
              {isCreatingMeal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Meal
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
