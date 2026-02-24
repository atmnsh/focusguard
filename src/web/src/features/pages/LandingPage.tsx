import { HeroSection } from "../components/landing";

export const LandingPage = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Main Content */}
      <main className="flex flex-col pt-17.5">
        <HeroSection />
      </main>
    </div>
  );
};
