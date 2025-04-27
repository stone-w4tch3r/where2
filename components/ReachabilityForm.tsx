"use client"

import { useState } from "react"
import { Form, Input, InputNumber, Button, Card, Spin, Alert } from "antd"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { calculateReachability } from "@/api/client"
import JsonViewer from "./JsonViewer"
import type { ReachabilityResult } from "@/types/reachability"
import { reachabilitySchema, type ReachabilityFormValues } from "@/schemas/formSchemas"

export default function ReachabilityForm() {
  const [result, setResult] = useState<ReachabilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReachabilityFormValues>({
    resolver: zodResolver(reachabilitySchema),
    defaultValues: {
      stationId: "",
      maxTransfers: 0,
    },
  })

  const onSubmit = async (data: ReachabilityFormValues) => {
    setLoading(true)
    setError(null)
    try {
      const reachabilityData = await calculateReachability(data.stationId, data.maxTransfers)
      setResult(reachabilityData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate reachability")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Calculate Reachability" className="mb-8">
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item label="Station ID" validateStatus={errors.stationId ? "error" : ""} help={errors.stationId?.message}>
          <Controller
            name="stationId"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Enter station ID" />}
          />
        </Form.Item>

        <Form.Item
          label="Max Transfers"
          validateStatus={errors.maxTransfers ? "error" : ""}
          help={errors.maxTransfers?.message}
        >
          <Controller
            name="maxTransfers"
            control={control}
            render={({ field }) => <InputNumber {...field} min={0} style={{ width: "100%" }} />}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Calculate
          </Button>
        </Form.Item>
      </Form>

      {error && <Alert message="Error" description={error} type="error" showIcon className="mt-4" />}

      {loading && <Spin className="block mt-4" />}

      {result && <JsonViewer data={result} title="Reachability Result" />}
    </Card>
  )
}
