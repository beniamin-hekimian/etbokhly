import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Search, X } from "lucide-react";
import Loading from "@/components/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import useMeals from "@/hooks/useMeals";
import MealCard from "@/components/meals/meal-card";

export default function MealsPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Derive active filters from URL (source of truth)
  const activeQuery = (router.isReady ? (router.query.q || "") : "").trim();
  const activeTag = router.isReady ? (router.query.tag || "") : "";

  // Local input state — initialized from URL, then user controls it
  const urlKey = activeQuery || "__none__";
  const [inputState, setInputState] = useState({ urlKey, value: activeQuery });
  if (inputState.urlKey !== urlKey) {
    setInputState({ urlKey, value: activeQuery });
  }
  const searchQuery = inputState.value;

  const { meals, isLoading, error, page, setPage, meta } = useMeals(null, {
    query: activeQuery,
    tag: activeTag,
  });

  const totalPages = meta?.totalPages || 1;
  const hasPrev = (meta?.page || 1) > 1;
  const hasNext = (meta?.page || 1) < totalPages;
  const totalResults = meta?.total ?? meals.length;

  // Tag chips — only tags that appear on approved meals (fetched once)
  const [allTags, setAllTags] = useState([]);
  useEffect(
    function () {
      let cancelled = false;

      async function loadTags() {
        try {
          const response = await fetch("/api/meal/tags");
          const result = await response.json();
          if (!cancelled && result?.status === "success") {
            setAllTags(Array.isArray(result.data) ? result.data : []);
          }
        } catch (err) {
          console.error("Failed to load meal tags:", err);
        }
      }

      loadTags();
      return function () {
        cancelled = true;
      };
    },
    [],
  );

  const pushURL = (q, tag, nextPage) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    if (nextPage && nextPage !== 1 && !q && !tag) {
      params.set("page", String(nextPage));
    }
    const qs = params.toString();
    router.push(qs ? `/meals?${qs}` : "/meals", undefined, { shallow: true });
  };

  const resetPageAndPush = (q, tag) => {
    setPage(1);
    pushURL(q, tag, 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    resetPageAndPush(searchQuery.trim(), activeTag);
  };

  const handleTagClick = (tagName) => {
    const next = activeTag === tagName ? "" : tagName;
    resetPageAndPush(searchQuery.trim(), next);
  };

  const clearSearch = () => {
    setInputState({ urlKey: "__none__", value: "" });
    setPage(1);
    router.push("/meals", undefined, { shallow: true });
  };

  const goToPage = (nextPage) => {
    setPage(nextPage);
    pushURL(activeQuery, activeTag, nextPage);
  };

  const hasActiveFilter = activeQuery || activeTag;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <>
        <Head>
          <title>{t.meals.metaTitle}</title>
        </Head>

        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-20">
          <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
            <CardContent className="flex min-h-36 flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="font-medium text-foreground">{t.meals.errorTitle}</p>
              <p className="text-sm text-muted-foreground">{t.meals.errorDescription}</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t.meals.metaTitle}</title>
        <meta name="description" content={t.meals.metaDescription} />
      </Head>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-8">
        {/* Page Header */}
        <div className="space-y-2 border-b border-border pb-6">
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">{t.meals.title}</h1>

          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{t.meals.description}</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex flex-1 items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setInputState((prev) => ({ ...prev, value: e.target.value }))}
              placeholder={t.meals.searchPlaceholder}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setInputState({ urlKey: "__none__", value: "" });
                  resetPageAndPush("", activeTag);
                }}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" className="px-5 font-bold">
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.hero?.searchButton}</span>
          </Button>
        </form>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t.meals.filterByTag}</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagClick("")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  !activeTag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.meals.allTags}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.name)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-colors ${
                    activeTag === tag.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag.name.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters + Results Header */}
        {hasActiveFilter && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {activeQuery && (
                <>
                  {t.meals.searchResultsFor} &quot;{activeQuery}&quot;
                  {activeTag && <> — {t.meals.filterByTag}: {activeTag}</>}
                </>
              )}
              {!activeQuery && activeTag && (
                <>
                  {t.meals.filterByTag}: {activeTag}
                </>
              )}
              {" - "}{totalResults}{" "}
              {totalResults === 1 ? "result" : "results"}
            </p>
            <Button variant="ghost" size="sm" onClick={clearSearch} className="text-xs font-bold text-primary">
              {t.meals.clearSearch}
            </Button>
          </div>
        )}

        {/* Meals Grid */}
        {meals.length === 0 ? (
          <Card className="border-border/60 bg-card shadow-sm">
            <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 p-6">
              <p className="text-sm text-muted-foreground">
                {hasActiveFilter ? t.meals.noSearchResults : t.meals.emptyState}
              </p>
              {hasActiveFilter && (
                <Button variant="ghost" size="sm" onClick={clearSearch} className="mt-2 text-xs font-bold text-primary">
                  {t.meals.clearSearch}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>

            {(hasPrev || hasNext) && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" disabled={!hasPrev} onClick={() => goToPage(page - 1)}>
                  {t.meals.prevPage}
                </Button>
                <span className="text-sm font-bold text-muted-foreground">
                  {meta.page} / {totalPages}
                </span>
                <Button variant="outline" disabled={!hasNext} onClick={() => goToPage(page + 1)}>
                  {t.meals.nextPage}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
