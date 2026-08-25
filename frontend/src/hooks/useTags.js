import { useEffect, useState } from "react";
import { toast } from "sonner";

// Custom hook for managing meal tags, including fetching available tags and toggling selected tags
export default function useTags({ setValue, selectedTags = [] }) {
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState(false);

  /* Load available tags from backend API */
  useEffect(function () {
    let cancelled = false;

    async function loadTags() {
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
    }

    loadTags();

    return function () {
      cancelled = true;
    };
  }, []);

  /* Toggle selected tags with a maximum limit of 3 */
  function toggleTag(tagId) {
    const nextTags = selectedTags.includes(tagId)
      ? selectedTags.filter(function (value) {
          return value !== tagId;
        })
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
  }

  return {
    tags,
    tagsLoading,
    tagsError,
    toggleTag,
  };
}
