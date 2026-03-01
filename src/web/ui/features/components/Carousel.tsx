import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import SpriteAnimator from "../components/animation";
import { availableAnimations } from "../components/animation";
import { Button } from "./ui/button";

export function CarouselComponent() {
  const [selectedAvatar, setSelectedAvatar] = React.useState<number>(() => {
    return parseInt(localStorage.getItem("selectedAvatar") || "0", 10);
  });

  const handleSelect = (index: number) => {
    setSelectedAvatar(index);
    localStorage.setItem("selectedAvatar", index.toString());
  };

  return (
    <section className=" flex items-center">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl dark:text-white text-blacks">
            Изберете своя аватар
          </h2>
          <p className="text-muted-foreground text-xl">
            Повече аватари и кастомизация очаквайте в новите версии
          </p>
        </div>
        <div className="grid grid-cols-1 lg:w-4xl  gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableAnimations.map((anim, index) => {
            const isSelected = selectedAvatar === index;
            return (
              <Card
                className={`flex items-center pt-10 pb-10 max-lg:last:col-span-full ${isSelected ? "border-[#f7c44d] shadow-[0_0_15px_rgba(247,196,77,0.5)]" : "hover:shadow-[#f7c44d]"}`}
                key={index}
              >
                <CardContent className="-mb-4">
                  <SpriteAnimator animationIndex={index} />
                </CardContent>
                <CardHeader className="flex items-center mr-16">
                  <CardTitle className="text-xl text-nowrap">
                    {anim.name}
                  </CardTitle>
                </CardHeader>
                <CardFooter>
                  <Button
                    onClick={() => handleSelect(index)}
                    disabled={isSelected}
                    className={`group rounded-lg flex self-center ${isSelected
                        ? "bg-slate-300 text-slate-500 cursor-default hover:bg-slate-300"
                        : "text-black bg-[#f7c44d] hover:bg-accent"
                      }`}
                    size="lg"
                  >
                    {isSelected ? "Избран" : "Избери"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
