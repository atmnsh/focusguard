import * as React from "react";
import { Card, CardContent } from "../components/ui/card";
import SpriteAnimator from "../components/animation";
import { availableAnimations } from "../components/animation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

export function CarouselComponent() {
  return (
    <div className="mx-auto justify-center">
      <Carousel
        opts={{
          align: "start",
        }}
        className="mt-12 lg:max-w-full mx-auto flex justify-self-center justify-center sm:max-w-1/2"
      >
        <CarouselContent>
          {availableAnimations.map((anim, index) => (
            <CarouselItem key={index} className="pl-2 basis-full">
              <Card className="m-3">
                <CardContent className="flex aspect-square items-center justify-center">
                  <SpriteAnimator animationIndex={index} />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
