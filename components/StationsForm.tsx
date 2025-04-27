"use client"

import { useState } from "react"
import { Button, Card, Spin, Alert } from "antd"
import { fetchStations } from "@/api/client"
import JsonViewer from "./JsonViewer"
import type { Station } from "@/types/station"

export default function StationsForm() {
  const [stations, setStations] = useState<Station[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLoadStations = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStations()
      setStations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stations")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Load Stations" className="mb-8">
      <Button type="primary" onClick={handleLoadStations} loading={loading}>
        Load All Stations
      </Button>

      {error && <Alert message="Error" description={error} type="error" showIcon className="mt-4" />}

      {loading && <Spin className="block mt-4" />}

      {stations && <JsonViewer data={stations} title="Stations" />}
    </Card>
  )
}
