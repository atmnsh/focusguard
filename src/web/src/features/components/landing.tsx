"use client";

import { useEffect, useState, useRef, useCallback } from "react";

import { ArrowRightIcon } from "lucide-react";

import Autoplay from "embla-carousel-autoplay";

import SpriteAnimator from "../components/animation";
import { availableAnimations } from "../components/animation";

import { Separator } from "../components/ui/separator";

import { Button } from "../components/ui/button";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../components/ui/carousel";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [commentsApi, setCommentsApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Use availableAnimations length for looping
  const totalItems = availableAnimations.length;

  useEffect(() => {
    if (!mainApi) {
      return;
    }

    setCurrent(mainApi.selectedScrollSnap());
    mainApi.on("select", () => {
      const selectedIndex = mainApi.selectedScrollSnap();

      setCurrent(selectedIndex);

      // Sync all carousels with main carousel
      thumbApi?.scrollTo(selectedIndex);
      commentsApi?.scrollTo(selectedIndex);
    });
  }, [mainApi, thumbApi, commentsApi]);

  useEffect(() => {
    if (!thumbApi) {
      return;
    }

    thumbApi.on("select", () => {
      const selectedIndex = thumbApi.selectedScrollSnap();

      setCurrent(selectedIndex);

      // Sync main and comments carousel with thumbnail carousel
      mainApi?.scrollTo(selectedIndex);
      commentsApi?.scrollTo(selectedIndex);
    });
  }, [thumbApi, mainApi, commentsApi]);

  useEffect(() => {
    if (!commentsApi) {
      return;
    }

    commentsApi.on("select", () => {
      const selectedIndex = commentsApi.selectedScrollSnap();

      setCurrent(selectedIndex);

      // Sync main and thumbnail carousel with comments carousel
      mainApi?.scrollTo(selectedIndex);
      thumbApi?.scrollTo(selectedIndex);
    });
  }, [commentsApi, mainApi, thumbApi]);

  const handleThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index);
    },
    [mainApi],
  );

  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));

  // Helper to get animation index with wrap-around for infinite loop feel
  const getAnimIndex = (index: number) => index % totalItems;

  return (
    <section className="flex-1 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="grid grid-cols-1 gap-6 gap-y-12 md:gap-y-16 lg:grid-cols-5">
          <div className="flex w-full flex-col justify-center gap-5 max-lg:items-center lg:col-span-3 lg:h-95.5">
            <h1 className="text-3xl leading-[1.29167] font-semibold text-balance max-lg:text-center sm:text-4xl lg:text-5xl">
              FocusGuard - blablabla
            </h1>

            <p className="text-muted-foreground max-w-xl text-xl max-lg:text-center text-wrap">
              blablablablablablablablablablablablablablablablablabla
              blablablablablablablablablablablablablablablablablabla
              blablablablablablablablablablablablablablablablablablablablabla
            </p>

            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="group relative w-fit overflow-hidden text-base bg-[#f7c44d] hover:bg-accent text-black"
                onClick={() => navigate("/signup")}
              >
                Регистрирай се
                <ArrowRightIcon />
              </Button>
              <Button
                size="lg"
                asChild
                className="bg-primary/10 hover:bg-primary/20 text-primary text-base"
                onClick={() => navigate("/login")}
              >
                <a href="#">Влез</a>
              </Button>
            </div>
          </div>

          {/* Main Carousel - Large Animation Display */}
          <Carousel
            className="w-full lg:col-span-2"
            setApi={setMainApi}
            plugins={[plugin.current]}
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              {availableAnimations.map((anim, index) => (
                <CarouselItem
                  key={index}
                  className="flex w-full items-center justify-center"
                >
                  <div className="flex h-95 items-center justify-center">
                    <SpriteAnimator animationIndex={index} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="grid grid-cols-1 gap-24 gap-y-12 md:gap-y-16 lg:grid-cols-5">
          {/* Thumbnail Carousel - Small Animation Previews */}
          <Carousel
            className="relative w-full max-lg:order-2 lg:col-span-3"
            setApi={setThumbApi}
            opts={{
              loop: true,
            }}
          >
            <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-1 w-25 bg-gradient-to-r via-85% to-transparent" />
            <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-1 w-25 bg-gradient-to-l via-85% to-transparent" />
            <CarouselContent className="my-1 flex">
              {availableAnimations.map((anim, index) => (
                <CarouselItem
                  key={index}
                  className={cn(
                    "basis-1/2 cursor-pointer sm:basis-1/3 md:basis-1/4 lg:basis-1/3 xl:basis-1/4",
                  )}
                  onClick={() => handleThumbClick(index)}
                >
                  <div className="relative flex h-33 items-center justify-center">
                    <div
                      className={cn(
                        "absolute bottom-0 -z-1",
                        current === index ? "text-primary" : "text-border",
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg "
                        width="161"
                        height="92"
                        viewBox="0 0 161 92"
                        fill="none"
                      >
                        <path
                          d="M0.682517 80.6118L0.501193 39.6946C0.480127 34.9409 3.80852 30.8294 8.46241 29.8603L148.426 0.713985C154.636 -0.579105 160.465 4.16121 160.465 10.504V80.7397C160.465 86.2674 155.98 90.7465 150.453 90.7397L10.6701 90.5674C5.16936 90.5607 0.706893 86.1125 0.682517 80.6118Z"
                          stroke="currentColor"
                        />
                      </svg>
                    </div>
                    {/* Scaled down animation for thumbnail */}
                    <div className="scale-50">
                      <SpriteAnimator animationIndex={index} />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};
