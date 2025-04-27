"use client"

import { ConfigProvider } from "antd"
import StationsForm from "@/components/StationsForm"
import RoutesByStationForm from "@/components/RoutesByStationForm"
import ReachabilityForm from "@/components/ReachabilityForm"

export default function Page() {
  return (
    <ConfigProvider>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Where2 Debug Interface</h1>

        <StationsForm />
        <RoutesByStationForm />
        <ReachabilityForm />
      </div>
    </ConfigProvider>
  )
}
