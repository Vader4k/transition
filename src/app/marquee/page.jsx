"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Flip, ScrollTrigger } from "gsap/all"
import { useRef } from "react"

gsap.registerPlugin(Flip, ScrollTrigger)

const MarqueePage = () => {

    const originalMaqueeImg = useRef(null);
    let pinnedMaqueeImageClone = null;
    let isImgCloneActive = false;
    let flipAnimation = null;

    const light = '#edf1e8'
    const dark = '#101010;'

    const interpolateColor = (col1, col2, col3) => {
        return gsap.utils.interpolate(col1, col2, col3)
    }

    useGSAP(() => {
        //marque animation
        gsap.to('.marquee-images', {
            scrollTrigger: {
                trigger: '.marquee',
                start: 'top bottom',
                end: 'top top',
                scrub: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const xPosition = -75 + progress * 25;
                    gsap.set(".marquee-images", {
                        x: `${xPosition}%`
                    })
                }
            }
        })

        //pinned image animation
        function createPinnedMaqueeClone() {
            if (isImgCloneActive || !originalMaqueeImg.current) return;

            const rect = originalMaqueeImg.current.getBoundingClientRect();
            console.log(rect)
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            pinnedMaqueeImageClone = originalMaqueeImg.current.cloneNode(true);

            gsap.set(pinnedMaqueeImageClone, {
                position: 'fixed',
                left: centerX - originalMaqueeImg.current.offsetWidth / 2 + 'px',
                top: centerY - originalMaqueeImg.current.offsetHeight / 2 + 'px',
                width: originalMaqueeImg.current.offsetWidth + 'px',
                height: originalMaqueeImg.current.offsetheight + 'px',
                transform: 'rotate(-5deg)',
                transformOrigin: 'center center',
                pointerEvents: 'none',
                willChange: 'transform',
                zIndex: 100
            })

            //append clone to document body
            document.body.appendChild(pinnedMaqueeImageClone);
            //hide original
            gsap.set(originalMaqueeImg.current, { opacity: 0 });

            isImgCloneActive = true;
        }


        function removePinnedMarqueeImgClone() {
            if (!isImgCloneActive) return;
            if (pinnedMaqueeImageClone && document.body.contains(pinnedMaqueeImageClone)) {
                pinnedMaqueeImageClone.remove();
                pinnedMaqueeImageClone = null;
            }
            if (originalMaqueeImg.current) {
                gsap.set(originalMaqueeImg.current, { opacity: 1 }); // restore original
            }

            isImgCloneActive = false;
        }

        //pin the horizontal scroll and make it x5
        ScrollTrigger.create({
            trigger: ".horizontal-scroll",
            start: "top top",
            end: () => `+=${window.innerHeight * 5}`,
            pin: true,
        })

        // trigger clone when scroll reaches top
        ScrollTrigger.create({
            trigger: ".marquee",
            start: "top top",
            onEnter: createPinnedMaqueeClone,
            onEnterBack: createPinnedMaqueeClone,
            onLeaveBack: removePinnedMarqueeImgClone
        });

        //flip animation
        ScrollTrigger.create({
            trigger: ".horizontal-scroll",
            start: "top 50%",
            end: () => `+=${window.innerHeight * 5.5}`,
            onEnter: () => {
                if (pinnedMaqueeImageClone && isImgCloneActive && !flipAnimation) {
                    const state = Flip.getState(pinnedMaqueeImageClone);

                    gsap.set(pinnedMaqueeImageClone, {
                        position: 'fixed',
                        left: '0px',
                        top: '0px',
                        width: "100%",
                        height: "100svh",
                        transform: "rotate(0deg)",
                        transformOrigin: 'center center'
                    })

                    flipAnimation = Flip.from(state, {
                        duration: 1,
                        ease: 'none',
                        paused: true,
                    })
                }
            },
            onLeaveBack: () => {
                if (flipAnimation) {
                    flipAnimation.kill();
                    flipAnimation = null
                }
                gsap.set('.container', {
                    background: '#edf1e8'
                });
                gsap.set(".horizontal-scroll-wrapper", {
                    x: "0%"
                })
            }
        })

        ScrollTrigger.create({
            trigger: ".horizontal-scroll",
            start: "top 50%",
            end: () => `+=${window.innerHeight * 5.5}`,
            onUpdate: (self) => {
                const progress = self.progress;

                if (progress <= 0.05) {
                    const bgColorProgress = Math.min(progress / 0.05, 1);
                    const newBgColor = interpolateColor('#edf1e8', '#101010', bgColorProgress);

                    gsap.set('.container', {
                        backgroundColor: newBgColor
                    })
                } else if (progress > 0.05) {
                    gsap.set('.container', {
                        backgroundColor: '#101010'
                    })
                }

                if (progress <= 0.2) {
                    const scaleProgress = progress / 0.2;
                    if (flipAnimation) {
                        flipAnimation.progress(scaleProgress);
                    }
                }

                if (progress > 0.2 && progress <= 0.95) {
                    if (flipAnimation) {
                        flipAnimation.progress(1);
                    }

                    const horizontalProgress = (progress - 0.2) / 0.75

                    const wrappedTranslateX = -66.67 * horizontalProgress;
                    gsap.set(".horizontal-scroll-wrapper", {
                        x: `${wrappedTranslateX}%`
                    })

                    const slideMovement = (66.67 / 100) * 3 * horizontalProgress;
                    const imageTranslateX = -slideMovement * 100;
                    gsap.set(pinnedMaqueeImageClone, {
                        x: `${imageTranslateX}%`
                    })
                } else if (progress > 0.95) {
                    if (flipAnimation) {
                        flipAnimation.progress(1)
                    }
                    gsap.set(pinnedMaqueeImageClone, {
                        x: '-200%'
                    });
                    gsap.set(".horizontal-scroll-wrapper", {
                        x: '-66.67%'
                    })
                }
            }
        })

    })

    return (
        <div className='container'>
            <section className='hero'>
                <h1>Fragments of thought arranged in sequence become patterns. They unfold step by step, shaping meaning as they move forward.</h1>
            </section>

            <section className='marquee'>
                <div className="marquee-wrapper">
                    <div className="marquee-images">
                        <div className='marquee-img'><img src="/5.png" alt="" /></div>
                        <div className='marquee-img'><img src="/6.jpeg" alt="" /></div>
                        <div className='marquee-img'><img src="/7.jpeg" alt="" /></div>
                        <div className='marquee-img'><img src="/8.png" alt="" /></div>
                        <div className='marquee-img'><img src="/9.jpeg" alt="" /></div>
                        <div className='marquee-img'><img src="/10.jpeg" alt="" /></div>
                        <div ref={originalMaqueeImg} className='marquee-img pin'><img src="/11.jpeg" alt="" /></div>
                        <div className='marquee-img'><img src="/12.png" alt="" /></div>
                        <div className='marquee-img'><img src="/13.png" alt="" /></div>
                        <div className='marquee-img'><img src="/14.PNG" alt="" /></div>
                        <div className='marquee-img'><img src="/15.JPG" alt="" /></div>
                        <div className='marquee-img'><img src="/16.jpeg" alt="" /></div>
                        <div className='marquee-img'><img src="/17.jpeg" alt="" /></div>
                    </div>
                </div>
            </section>

            <section className="horizontal-scroll">
                <div className="horizontal-scroll-wrapper">
                    <div className="horizontal-slide horizontal-spacer"></div>
                    <div className="horizontal-slide">
                        <div className="col">
                            <h3>
                                A landscape in constant transition, where every shape, sound, and shadow refuses to stay still. What seems stable begins to dissolve, and what fades returns again in a new form.
                            </h3>
                        </div>
                        <div className='col'>
                            <img src="/5.png" alt="" />
                        </div>
                    </div>
                    <div className="horizontal-slide">
                        <div className="col">
                            <h3>
                                The rhythm of motion carries us forward into space that feel familiar yet remain undefined. Each shift is subtle, yet together they remind us that nothing we see is ever permanent.
                            </h3>
                        </div>
                        <div className='col'>
                            <img src="/6.jpeg" alt="" />
                        </div>
                    </div>
                </div>
            </section>

            <section className='outro'>
                <h1>
                    Shadows fold into light. Shapes shift across the frame, reminding us that stillness is only temporary.
                </h1>
            </section>
        </div>
    )
}

export default MarqueePage