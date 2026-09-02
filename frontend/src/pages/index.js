import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { LatestMeals } from "@/components/home/latest-meals";
import { TopChefs } from "@/components/home/top-chefs";
// import { Testimonials } from "@/components/home/testimonials";
import { CallToAction } from "@/components/home/call-to-action";
import Loading from "@/components/loading";
import useHome from "@/hooks/useHome";

export default function Home() {
  const { latestMeals, topChefs, isLoading } = useHome();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <LatestMeals meals={latestMeals} />
      <TopChefs chefs={topChefs} />
      {/* <Testimonials /> */}
      <CallToAction />
    </main>
  );
}
