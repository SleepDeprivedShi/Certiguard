import { useState, useRef } from 'react'

interface BBox {
  ref: string
  x: number
  y: number
  w: number
  h: number
}

interface BBoxOverlayProps {
  pageNumber: number
  bboxes: BBox[]
}

export default function BBoxOverlay({ pageNumber, bboxes }: BBoxOverlayProps) {
  const [showBBoxes, setShowBBoxes] = useState(true)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setShowBBoxes(!showBBoxes)}
          className={`px-3 py-1 text-sm rounded-lg ${
            showBBoxes ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {showBBoxes ? 'Hide Boxes' : 'Show Boxes'}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50"
          >
            −
          </button>
          <span className="text-sm text-slate-600">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50"
          >
            +
          </button>
        </div>
        <span className="text-sm text-slate-500">Page {pageNumber}</span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 bg-slate-100 rounded-lg overflow-auto flex items-center justify-center"
      >
        <div
          className="relative bg-white shadow-lg"
          style={{ width: 595 * zoom, height: 842 * zoom, transformOrigin: 'center' }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <p className="text-sm">PDF Page {pageNumber}</p>
          </div>

          {showBBoxes &&
            bboxes.map((bbox, i) => (
              <div
                key={bbox.ref}
                className="absolute border-2 border-blue-500 bg-blue-500/20"
                style={{
                  left: bbox.x * zoom,
                  top: bbox.y * zoom,
                  width: bbox.w * zoom,
                  height: bbox.h * zoom
                }}
              >
                <span className="absolute -top-5 left-0 bg-blue-500 text-white text-xs px-1 rounded">
                  {i + 1}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}