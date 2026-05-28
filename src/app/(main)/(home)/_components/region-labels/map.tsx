"use client";

import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

const GEO_URL =
  "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json";
const FETCH_TIMEOUT_MS = 5000;

type MapState =
  | { status: "loading" }
  | { status: "ready"; option: Record<string, unknown> }
  | { status: "error" };

async function fetchGeoJson(signal: AbortSignal): Promise<unknown> {
  const res = await fetch(GEO_URL, { signal });
  if (!res.ok) {
    throw new Error(`Geo JSON ${res.status}`);
  }
  return res.json();
}

export default function Map() {
  const [state, setState] = useState<MapState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    fetchGeoJson(controller.signal)
      .then((chinaJson) => {
        import("echarts").then((echarts) => {
          echarts.registerMap("china", chinaJson as Parameters<
            typeof echarts.registerMap
          >[1]);
          setState({
            status: "ready",
            option: {
              tooltip: { trigger: "item" },
              series: [
                {
                  name: "中国地图",
                  type: "map",
                  map: "china",
                  roam: true,
                  center: [113, 23],
                  zoom: 8,
                  itemStyle: {
                    areaColor: "#C8D0D8",
                    borderColor: "#fff",
                  },
                  emphasis: {
                    itemStyle: { areaColor: "#3056D3" },
                    label: { color: "#fff" },
                  },
                  label: { show: true, fontSize: 10 },
                  data: [
                    { name: "广东省", itemStyle: { areaColor: "#3056D3" } },
                  ],
                },
              ],
            },
          });
        });
      })
      .catch(() => {
        setState({ status: "error" });
      })
      .finally(() => {
        window.clearTimeout(timer);
      });

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  if (state.status === "loading") {
    return <div className="h-[422px] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />;
  }

  if (state.status === "error") {
    return (
      <div className="flex h-[422px] items-center justify-center rounded-lg bg-gray-100 text-sm text-dark-4 dark:bg-gray-800 dark:text-dark-6">
        地图数据暂不可用
      </div>
    );
  }

  return (
    <div className="h-[422px]">
      <ReactECharts
        option={state.option}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
