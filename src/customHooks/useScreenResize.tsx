import { useState, useEffect } from 'react'

const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState<number>(window.innerWidth)

    useEffect(() => {
        const handleResize = () => {
            setScreenSize(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    if (screenSize < 1000) {
        let result = true
        return result
    } else {
        let result = false
        return result
    }
}

export default useScreenSize
