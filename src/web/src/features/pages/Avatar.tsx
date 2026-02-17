import { Sidebar } from "../components/Sidebar";
import { CarouselComponent } from "../components/Carousel";
import { Button } from "../components/ui/button";

export const Avatar = () => {
  return (
    <div className="">
      <Sidebar />
      <CarouselComponent />
      <Button className="flex justify-self-center mt-10 w-sm">Избери</Button>
    </div>
  );
};
