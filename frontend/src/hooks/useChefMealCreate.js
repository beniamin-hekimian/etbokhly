import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function useChefMealCreate({ setValue, reset, selectedTags }) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState(false);

  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCreatingMeal, setIsCreatingMeal] = useState(false);
  const [createMealError, setCreateMealError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    let cancelled = false;

    const loadTags = async () => {
      try {
        setTagsLoading(true);
        setTagsError(false);

        const token = localStorage.getItem("token");

        const response = await fetch("/api/tag", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Could not load tags.");
        }

        if (!cancelled) {
          setTags(result?.data || []);
        }
      } catch (error) {
        console.error("Failed to load tags:", error);

        if (!cancelled) {
          setTagsError(true);
        }
      } finally {
        if (!cancelled) {
          setTagsLoading(false);
        }
      }
    };

    loadTags();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, router]);

  const toggleTag = (tagId) => {
    const nextTags = selectedTags.includes(tagId)
      ? selectedTags.filter((value) => value !== tagId)
      : selectedTags.length < 3
        ? [...selectedTags, tagId]
        : selectedTags;

    if (!selectedTags.includes(tagId) && selectedTags.length >= 3) {
      toast.error("You can select up to 3 tags.");
    }

    setValue("tags", nextTags, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleImageChange = async (event) => {
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

      const response = await fetch("/api/meal/uploadphoto", {
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

      setValue("photo", "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setImagePreview("");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const submitMeal = async (values) => {
    setCreateMealError("");

    if (!values.photo) {
      toast.error("Meal image is required.");
      return false;
    }

    if (values.tags.length < 1) {
      toast.error("Select at least one tag.");
      return false;
    }

    if (values.tags.length > 3) {
      toast.error("You can select up to 3 tags.");
      return false;
    }

    try {
      setIsCreatingMeal(true);

      const token = localStorage.getItem("token");

      const response = await fetch("/api/meal/createmeal", {
        method: "POST",
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Could not create meal.");
      }

      toast.success(result?.message || "Meal created successfully.");

      reset({
        name: "",
        description: "",
        price: "",
        photo: "",
        tags: [],
      });

      setImagePreview("");

      router.push("/meals");
      return true;
    } catch (error) {
      console.error("Create meal error:", error);

      const message = error instanceof Error ? error.message : "Could not create meal.";

      setCreateMealError(message);
      toast.error(message);
      return false;
    } finally {
      setIsCreatingMeal(false);
    }
  };

  return {
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
  };
}
