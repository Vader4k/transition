"use client"
import { useTransitionRouter } from "next-view-transitions"

const Nav = () => {
    const router = useTransitionRouter();

    const slideInout = () => {
        document.documentElement.animate(
            [
                {
                    opacity: 1,
                    transform: "translateY(0)"
                },
                {
                    opacity: 0.2,
                    transform: "translateY(-35%)"
                }
            ], {
            duration: 1500,
            easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
            fill: 'forwards', // makes sure the elements stays in its final position after the animation completes
            pseudoElement: "::view-transition-old(root)" // means the animation only applies to the outgoing page
        }
        )

        //once the whole page has faded out, we animate the new page by making it come from the bottom
        document.documentElement.animate(
            [
                {
                    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" //covers the page
                },
                {
                    clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)" //reveals the page
                }
            ],
            {
                duration: 1500,
                easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
                fill: 'forwards',
                pseudoElement: "::view-transition-new(root)"
            }
        )
    }

    return (
        <div className='nav'>
            <div className='logo'>
                <div className='link'>
                    <a onClick={(e) => {
                        e.preventDefault()
                        router.push('/', {
                            onTransitionReady: slideInout,
                        })
                    }}>Index</a>
                </div>
            </div>
            <div className='links'>
                <div className="link">
                    <a onClick={(e) => {
                        e.preventDefault()
                        router.push('/projects', {
                            onTransitionReady: slideInout,
                        })
                    }}>Projects</a>
                </div>
                <div className="link">
                    <a onClick={(e) => {
                        e.preventDefault()
                        router.push('/info', {
                            onTransitionReady: slideInout,
                        })
                    }}>Info</a>
                </div>
                 <div className="link">
                    <a onClick={(e) => {
                        e.preventDefault()
                        router.push('/marquee', {
                            onTransitionReady: slideInout,
                        })
                    }}>Marquee</a>
                </div>
            </div>
        </div>
    )
}

export default Nav