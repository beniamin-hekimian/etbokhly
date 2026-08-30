const transformMeal = (meal) => {
  const { _count, likes, ...rest } = meal;

  return {
    ...rest,
    likesCount: _count?.likes ?? 0,
    likedByMe: Boolean(likes && likes.length > 0),
  };
};

export const decorateMealLikes = (mealOrMeals) => {
  if (Array.isArray(mealOrMeals)) return mealOrMeals.map(transformMeal);
  return mealOrMeals ? transformMeal(mealOrMeals) : mealOrMeals;
};