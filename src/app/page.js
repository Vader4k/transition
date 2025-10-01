"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/all";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(SplitText, ScrollTrigger);

const HomePage = () => {
  const container = useRef();

  // useGSAP(() => {
  //   const heroText = SplitText.create(".home h1", {
  //     type: 'chars'
  //   })

  //     gsap.set(heroText.chars , {
  //       y: 400,
  //     })

  //     gsap.to(heroText.chars, {
  //       y: 0,
  //       duration:1,
  //       stagger: 0.075,
  //       ease: "power4.out",
  //       delay: 1
  //     })
  // })

  useGSAP(
    () => {
      const heroText = SplitText.create(".home h1", {
        type: "chars",
      });

      gsap.set(heroText.chars, {
        y: 400,
      });

      gsap.to(heroText.chars, {
        y: 0,
        duration: 1,
        stagger: 0.075,
        ease: "power4.out",
        delay: 1,
      });
    },
    { scope: container }
  );

  return (
    <div className="home" ref={container}>
      <h1 className="">Kaelon</h1>
    </div>
  );
};

export default HomePage;
