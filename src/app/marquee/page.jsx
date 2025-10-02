"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Flip, ScrollTrigger } from "gsap/all"
import { useRef } from "react"

gsap.registerPlugin(Flip, ScrollTrigger)

const MarqueePage = () => {
    // Reference to the original marquee image (the one we want to clone & animate)
    const originalMaqueeImg = useRef(null);

    // Variables to manage state of the pinned/animated clone
    let pinnedMaqueeImageClone = null; // stores the DOM node of the cloned image
    let isImgCloneActive = false; // flag to prevent duplicate clones
    let flipAnimation = null; // reference to Flip animation instance

    // Colors used for background interpolation
    const light = '#edf1e8'
    const dark = '#101010;'

    // Utility to smoothly interpolate between two colors using GSAP’s utils
    const interpolateColor = (col1, col2, progress) => {
        return gsap.utils.interpolate(col1, col2, progress)
    }

    useGSAP(() => {
        /**
         * ================================
         * 1. MARQUEE ANIMATION (horizontal scroll illusion)
         * ================================
         * - Animates the `.marquee-images` element as user scrolls
         * - Uses ScrollTrigger scrub for smooth scroll-based progress
         * - Moves x-position from -75% to -50% (based on scroll progress)
         */
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


        /**
         * ================================
         * 2. IMAGE CLONING & PINNING
         * ================================
         * - Creates a fixed-position clone of the marquee image
         * - The clone is used for further animations (Flip, scaling, sliding)
         * - Original image is hidden (opacity 0) while clone is active
         */
        function createPinnedMaqueeClone() {
            if (isImgCloneActive || !originalMaqueeImg.current) return;

            // Get bounding box of original image
            const rect = originalMaqueeImg.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Clone the original DOM node
            pinnedMaqueeImageClone = originalMaqueeImg.current.cloneNode(true);

            // Position clone in the same place as original
            gsap.set(pinnedMaqueeImageClone, {
                position: 'fixed',
                left: centerX - originalMaqueeImg.current.offsetWidth / 2 + 'px',
                top: centerY - originalMaqueeImg.current.offsetHeight / 2 + 'px',
                width: originalMaqueeImg.current.offsetWidth + 'px',
                height: originalMaqueeImg.current.offsetHeight + 'px',
                transform: 'rotate(-5deg)',
                transformOrigin: 'center center',
                pointerEvents: 'none',
                willChange: 'transform',
                zIndex: 100
            })

            // Append clone to body and hide original
            document.body.appendChild(pinnedMaqueeImageClone);
            gsap.set(originalMaqueeImg.current, { opacity: 0 });
            isImgCloneActive = true;
        }

        // Remove clone, restore original image visibility, reset state
        function removePinnedMarqueeImgClone() {
            if (!isImgCloneActive) return;
            if (pinnedMaqueeImageClone && document.body.contains(pinnedMaqueeImageClone)) {
                pinnedMaqueeImageClone.remove();
                pinnedMaqueeImageClone = null;
            }
            if (originalMaqueeImg.current) {
                gsap.set(originalMaqueeImg.current, { opacity: 1 });
            }
            isImgCloneActive = false;
        }


        /**
         * ================================
         * 3. HORIZONTAL SCROLL PINNING
         * ================================
         * - Pins the `.horizontal-scroll` section for 5 screen heights
         * - Creates space for horizontal translation animation
         */
        ScrollTrigger.create({
            trigger: ".horizontal-scroll",
            start: "top top",
            end: () => `+=${window.innerHeight * 5}`,
            pin: true,
        })


        /**
         * ================================
         * 4. TRIGGERING IMAGE CLONE
         * ================================
         * - Clone appears when `.marquee` hits top of screen
         * - Removed when scrolling back up (LeaveBack)
         */
        ScrollTrigger.create({
            trigger: ".marquee",
            start: "top top",
            onEnter: createPinnedMaqueeClone,
            onEnterBack: createPinnedMaqueeClone,
            onLeaveBack: removePinnedMarqueeImgClone
        });


        /**
         * ================================
         * 5. FLIP ANIMATION (Image grows to fullscreen)
         * ================================
         * - Uses GSAP Flip plugin
         * - Captures state of element before changing its CSS
         * - Then animates from old state → new state seamlessly
         */
        ScrollTrigger.create({
            trigger: ".horizontal-scroll",
            start: "top 50%",
            end: () => `+=${window.innerHeight * 5.5}`,
            onEnter: () => {
                if (pinnedMaqueeImageClone && isImgCloneActive && !flipAnimation) {
                    // Save current position/state
                    const state = Flip.getState(pinnedMaqueeImageClone);

                    // Apply new final fullscreen styles
                    gsap.set(pinnedMaqueeImageClone, {
                        position: 'fixed',
                        left: '0px',
                        top: '0px',
                        width: "100%",
                        height: "100svh",
                        transform: "rotate(0deg)",
                        transformOrigin: 'center center'
                    })

                    // Animate from old state → new state
                    flipAnimation = Flip.from(state, {
                        duration: 1,
                        ease: 'none',
                        paused: true, // we control progress via ScrollTrigger
                    })
                }
            },
            onLeaveBack: () => {
                // Reset if user scrolls back up
                if (flipAnimation) {
                    flipAnimation.kill();
                    flipAnimation = null
                }
                gsap.set('.container', { background: '#edf1e8' });
                gsap.set(".horizontal-scroll-wrapper", { x: "0%" })
            }
        })


        /**
         * ================================
         * 6. SCROLL-BASED UPDATES
         * ================================
         * - Background color interpolates from light → dark
         * - Flip animation progresses with scroll
         * - Horizontal wrapper translates left
         * - Pinned image slides horizontally
         */
        ScrollTrigger.create({
            trigger: ".horizontal-scroll",
            start: "top 50%",
            end: () => `+=${window.innerHeight * 5.5}`,
            onUpdate: (self) => {
                const progress = self.progress;

                // Background color change (light → dark in first 5%)
                if (progress <= 0.05) {
                    const bgColorProgress = Math.min(progress / 0.05, 1);
                    const newBgColor = interpolateColor('#edf1e8', '#101010', bgColorProgress);
                    gsap.set('.container', { backgroundColor: newBgColor })
                } else if (progress > 0.05) {
                    gsap.set('.container', { backgroundColor: '#101010' })
                }

                // Scale pinned image fullscreen (0% → 20%)
                if (progress <= 0.2) {
                    const scaleProgress = progress / 0.2;
                    if (flipAnimation) flipAnimation.progress(scaleProgress);
                }

                // Horizontal slide (20% → 95%)
                if (progress > 0.2 && progress <= 0.95) {
                    if (flipAnimation) flipAnimation.progress(1);

                    const horizontalProgress = (progress - 0.2) / 0.75

                    // Translate wrapper
                    const wrappedTranslateX = -66.67 * horizontalProgress;
                    gsap.set(".horizontal-scroll-wrapper", {
                        x: `${wrappedTranslateX}%`
                    })

                    // Translate pinned image horizontally
                    const slideMovement = (66.67 / 100) * 3 * horizontalProgress;
                    const imageTranslateX = -slideMovement * 100;
                    gsap.set(pinnedMaqueeImageClone, { x: `${imageTranslateX}%` })
                }

                // Final exit (progress > 95%)
                else if (progress > 0.95) {
                    if (flipAnimation) flipAnimation.progress(1)
                    gsap.set(pinnedMaqueeImageClone, { x: '-200%' });
                    gsap.set(".horizontal-scroll-wrapper", { x: '-66.67%' })
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