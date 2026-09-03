import { useState, useEffect, useRef } from 'react'

export const useWhiteNoise = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
    }
  }, [])

  const toggleNoise = () => {
    if (isPlaying) {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        // Fade out for smoother stop
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1)
          setTimeout(() => {
            audioCtxRef.current?.suspend()
            setIsPlaying(false)
          }, 200)
        }
      }
    } else {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        const bufferSize = audioCtxRef.current.sampleRate * 2 // 2 seconds of noise
        const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate)
        const data = buffer.getChannelData(0)

        // Generate Brown noise (deep, soothing waterfall sound) instead of harsh white noise
        let lastOut = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          data[i] = (lastOut + (0.02 * white)) / 1.02
          lastOut = data[i]
          data[i] *= 3.5 // Compensate for volume drop
        }

        noiseNodeRef.current = audioCtxRef.current.createBufferSource()
        noiseNodeRef.current.buffer = buffer
        noiseNodeRef.current.loop = true

        // Lowpass filter to make it even softer and warmer
        const filter = audioCtxRef.current.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 400 // Very low cutoff for a deep rumble

        gainNodeRef.current = audioCtxRef.current.createGain()
        gainNodeRef.current.gain.value = 0.15 // Much lower, softer volume

        noiseNodeRef.current.connect(filter)
        filter.connect(gainNodeRef.current)
        gainNodeRef.current.connect(audioCtxRef.current.destination)

        noiseNodeRef.current.start()
      }
      
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0.5, audioCtxRef.current.currentTime, 0.1)
      }
      
      setIsPlaying(true)
    }
  }

  const setVolume = (val: number) => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(val, audioCtxRef.current.currentTime, 0.1)
    }
  }

  return { isPlaying, toggleNoise, setVolume }
}
