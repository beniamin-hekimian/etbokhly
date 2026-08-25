import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import useTags from "@/hooks/useTags";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Custom hook for managing chef-related functionalities, including meal creation and editing, image upload, and tag selection
export default function useChef({ setValue, reset, selectedTags, mode = "create", mealId = null }) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [mealLoading, setMealLoading] = useState(false);
  const [mealError, setMealError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { tags, tagsLoading, tagsError, toggleTag } = useTags({ setValue, selectedTags });

  /* Ensure user is authenticated */
  useEffect(
    function () {
      if (!authLoading && !isAuthenticated) {
        router.replace("/auth/login");
      }
    },
    [authLoading, isAuthenticated, router],
  );

  /* Load existing meal data if in edit mode */
  useEffect(
    function () {
      if (mode !== "edit" || !mealId || authLoading || !isAuthenticated) {
        return;
      }

      let cancelled = false;

      async function loadMeal() {
        try {
          setMealLoading(true);
          setMealError("");

          const token = localStorage.getItem("token");

          const response = await fetch(`/api/meal/${mealId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result?.message || "Could not load meal.");
          }

          const meal = result?.data;

          if (!meal) {
            throw new Error("Meal data was not found.");
          }

          const mealTagIds = Array.isArray(meal.tags)
            ? meal.tags
                .map(function (item) {
                  return item?.tag?.id;
                })
                .filter(Boolean)
            : [];

          if (!cancelled) {
            reset({
              name: meal.title || "",
              description: meal.content || "",
              price: meal.price || "",
              photo: meal.photo || "",
              tags: mealTagIds,
            });

            setImagePreview(meal.photo || "");
          }
        } catch (error) {
          console.error("Failed to load meal:", error);

          if (!cancelled) {
            setMealError(error instanceof Error ? error.message : "Could not load meal.");
          }
        } finally {
          if (!cancelled) {
            setMealLoading(false);
          }
        }
      }

      loadMeal();

      return function () {
        cancelled = true;
      };
    },
    [mealId, authLoading, isAuthenticated, reset, mode],
  );

  /* Handle image file selection and upload */
  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image size must be 5MB or less.");
      event.target.value = "";
      return;
    }

    try {
      setIsUploadingImage(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/chef/uploadphoto", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Image upload failed.");
      }

      const imageUrl = result?.url || result?.data?.url || result?.photo || result?.data?.photo;

      if (!imageUrl) {
        throw new Error("The image upload did not return an image URL.");
      }

      setValue("photo", imageUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });

      setImagePreview(imageUrl);
      toast.success("Meal image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  /* Submit meal data for creation or update */
  async function submitMeal(values) {
    setSubmitError("");

    if (mode === "edit" && !mealId) {
      toast.error("Meal ID is missing.");
      return;
    }

    if (!values.photo) {
      toast.error("Meal image is required.");
      return;
    }

    if (values.tags.length < 1) {
      toast.error("Select at least one tag.");
      return;
    }

    if (values.tags.length > 3) {
      toast.error("You can select up to 3 tags.");
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");
      const endpoint = mode === "edit" ? `/api/chef/${mealId}` : "/api/chef/createmeal";
      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: values.name,
          price: Number(values.price),
          content: values.description,
          photo: values.photo,
          tagIds: values.tags,
        }),
      });

      const contentType = response.headers.get("content-type");
      let result = {};

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.slice(0, 150) || "Empty or invalid response"}`);
      }

      if (!response.ok) {
        throw new Error(result?.message || `Could not ${mode === "edit" ? "update" : "create"} meal.`);
      }

      toast.success(result?.message || `Meal ${mode === "edit" ? "updated" : "created"} successfully.`);

      if (mode === "edit") {
        router.push("/profile");
      } else {
        router.push("/meals");
      }
    } catch (error) {
      console.error(`${mode === "edit" ? "Update" : "Create"} meal error:`, error);
      const message =
        error instanceof Error ? error.message : `Could not ${mode === "edit" ? "update" : "create"} meal.`;
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    authLoading,
    isAuthenticated,
    mealLoading,
    mealError,
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
  };
}
