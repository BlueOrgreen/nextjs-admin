"use client";

import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

export default function Map() {
  const [option, setOption] = useState<any>(null);

  useEffect(() => {
    fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")
      .then((res) => res.json())
      .then((chinaJson) => {
        import("echarts").then((echarts) => {
          echarts.registerMap("china", chinaJson);
          setOption({
            tooltip: {
              trigger: "item",
            },
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
                  itemStyle: {
                    areaColor: "#3056D3",
                  },
                  label: {
                    color: "#fff",
                  },
                },
                label: {
                  show: true,
                  fontSize: 10,
                },
                data: [{ name: "广东省", itemStyle: { areaColor: "#3056D3" } }],
              },
            ],
          });
        });
      })
      .catch((err) => {
        console.error("地图数据加载失败:", err);
      });
  }, []);

  if (!option) {
    return <div className="h-[422px] bg-gray-100">加载中...</div>;
  }

  return (
    <div className="h-[422px]">
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
