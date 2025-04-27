"use client"

import { useState } from "react"
import { Form, Input, Button, Card, Spin, Alert } from "antd"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { fetchRoutesByStationId } from "@/api/client"
import JsonViewer from "./JsonViewer"
import type { Route } from "@/types/route"
import { routesByStationSchema, type RoutesByStationFormValues } from "@/schemas/formSchemas"

export default function RoutesByStationForm() {
  const [routes, setRoutes] = useState<Route[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RoutesByStationFormValues>({
    resolver: zodResolver(routesByStationSchema),
    defaultValues: {
      stationId: "",
    },
  })

  const onSubmit = async (data: RoutesByStationFormValues) => {
    setLoading(true)
    setError(null)
    try {
      const routesData = await fetchRoutesByStationId(data.stationId)
      setRoutes(routesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load routes")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Load Routes by Station ID" className="mb-8">
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item label="Station ID" validateStatus={errors.stationId ? "error" : ""} help={errors.stationId?.message}>
          <Controller
            name="stationId"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Enter station ID" />}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Load Routes
          </Button>
        </Form.Item>
      </Form>

      {error && <Alert message="Error" description={error} type="error" showIcon className="mt-4" />}

      {loading && <Spin className="block mt-4" />}

      {routes && <JsonViewer data={routes} title="Routes" />}
    </Card>
  )
}
