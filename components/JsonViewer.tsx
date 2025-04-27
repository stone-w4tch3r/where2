"use client"

interface JsonViewerProps {
  data: any
  title?: string
}

export default function JsonViewer({ data, title }: JsonViewerProps) {
  return (
    <div className="json-viewer">
      {title && <h3 className="mb-2 text-lg font-medium">{title}</h3>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
