import * as React from "react";
import { Card, CardContent } from "../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

export function CarouselComponent() {
  return (
    <div className=" mx-auto justify-center">
      <Carousel
        opts={{
          align: "start",
        }}
        className="mt-12 lg:max-w-full mx-auto flex justify-self-center justify-center sm:max-w-1/2"
      >
        <CarouselContent className="">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="pl-2 basis-full ">
              <Card className="m-3">
                <CardContent className="flex aspect-square items-center justify-center ">
                  <span className="text-3xl font-semibold">{index + 1}</span>
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
