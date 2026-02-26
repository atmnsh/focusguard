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
  return (
    <section className=" flex items-center">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
            Изберете своя аватар
          </h2>
          <p className="text-muted-foreground text-xl">
            Повече аватари и кастомизация очаквайте в новите версии
          </p>
        </div>
        <div className="grid grid-cols-1 lg:w-4xl  gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableAnimations.map((anim, index) => (
            <Card
              className=" hover:shadow-[#f7c44d] max-lg:last:col-span-full flex items-center pt-10   pb-10"
              key={index}
            >
              <CardContent className="-mb-4">
                <SpriteAnimator animationIndex={index} />
              </CardContent>
              <CardHeader className="flex items-center mr-16">
                <CardTitle className="text-xl text-nowrap">
                  {anim.name}
                </CardTitle>
                {/* <CardDescription className='text-base'>{item.description}</CardDescription> */}
              </CardHeader>
              <CardFooter>
                <Button
                  className="group rounded-lg text-black bg-[#f7c44d] hover:bg-accent flex self-center "
                  size="lg"
                >
                  Избери
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
