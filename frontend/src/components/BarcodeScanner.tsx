import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode, Html5QrcodeResult } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Camera, SwitchCamera } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (decodedText: string, result: Html5QrcodeResult) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const navigate = useNavigate()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const hasNavigated = useRef(false)

  useEffect(() => {
    const initScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          setCameras(devices)
          startScanning(devices[0].id)
        } else {
          setError('No camera found on this device')
        }
      } catch (err) {
        setError('Camera access denied. Please allow camera permissions.')
        console.error('Camera error:', err)
      }
    }

    initScanner()

    return () => {
      // Cleanup scanner on unmount
      const cleanup = async () => {
        if (scannerRef.current && scannerRef.current.getState() === 2) { // State 2 = SCANNING
          try {
            await scannerRef.current.stop()
          } catch (err) {
            console.error('Scanner stop error:', err)
          }
        }
      }
      cleanup()
    }
  }, [])

  const handleScanSuccess = async (decodedText: string, result: Html5QrcodeResult) => {
    // Prevent multiple scans
    if (hasNavigated.current) return
    hasNavigated.current = true

    try {
      // Stop scanner immediately
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        await scannerRef.current.stop()
      }

      // Small delay to ensure camera is released
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check if it's a URL
      if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
        try {
          const url = new URL(decodedText)
          
          // Check if it's the same origin (your app)
          if (url.origin === window.location.origin || url.host.includes('localhost') || url.host.includes('127.0.0.1')) {
            // Extract the path from the URL
            const path = url.pathname + url.search + url.hash
            
            // Close modal first
            onClose()
            
            // Then navigate
            setTimeout(() => {
              navigate(path, { replace: false })
            }, 50)
            return
          } else {
            // External URL - open in new tab
            window.open(decodedText, '_blank')
            onClose()
            return
          }
        } catch (urlError) {
          console.error('URL parsing error:', urlError)
        }
      }
      
      // Check if it looks like a Gift ID (e.g., GIFT-0001)
      if (decodedText.match(/^GIFT-\d+$/i)) {
        onClose()
        setTimeout(() => {
          navigate(`/gifts/${decodedText}`, { replace: false })
        }, 50)
        return
      }
      
      // For other barcodes, pass to parent handler
      onScan(decodedText, result)
      
    } catch (err) {
      console.error('Scan handling error:', err)
      onScan(decodedText, result)
    }
  }

  const startScanning = async (cameraId: string) => {
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
        } catch (err) {
          // Ignore stop errors
        }
        scannerRef.current = null
      }

      scannerRef.current = new Html5Qrcode('scanner-container')
      
      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        handleScanSuccess,
        () => {} // ignore errors during scanning
      )
      
      setIsScanning(true)
      setError(null)
    } catch (err) {
      setError('Failed to start camera. Please try again.')
      console.error('Scanner start error:', err)
    }
  }

  const switchCamera = async () => {
    if (cameras.length <= 1) return
    
    const nextIndex = (currentCameraIndex + 1) % cameras.length
    setCurrentCameraIndex(nextIndex)
    await startScanning(cameras[nextIndex].id)
  }

  const handleClose = async () => {
    // Stop scanner before closing
    if (scannerRef.current && scannerRef.current.getState() === 2) {
      try {
        await scannerRef.current.stop()
      } catch (err) {
        console.error('Scanner stop error:', err)
      }
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode / QR Code
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            id="scanner-container" 
            className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative"
          />
          
          {error && (
            <div className="text-center text-destructive text-sm p-4 bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}
          
          {!isScanning && !error && (
            <div className="text-center text-muted-foreground text-sm p-4">
              Initializing camera...
            </div>
          )}
          
          {isScanning && (
            <p className="text-center text-muted-foreground text-sm">
              Point your camera at a barcode or QR code
            </p>
          )}
          
          <div className="flex gap-2">
            {cameras.length > 1 && (
              <Button 
                variant="outline" 
                onClick={switchCamera}
                className="flex-1"
              >
                <SwitchCamera className="h-4 w-4 mr-2" />
                Switch Camera
              </Button>
            )}
            <Button 
              variant="destructive" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
