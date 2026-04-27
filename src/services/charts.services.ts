export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = [
    {
      name: "桌面端",
      percentage: 0.65,
      amount: 1625,
    },
    {
      name: "平板",
      percentage: 0.1,
      amount: 250,
    },
    {
      name: "移动端",
      percentage: 0.2,
      amount: 500,
    },
    {
      name: "未知",
      percentage: 0.05,
      amount: 125,
    },
  ];

  if (timeFrame === "yearly") {
    data[0].amount = 19500;
    data[1].amount = 3000;
    data[2].amount = 6000;
    data[3].amount = 1500;
  }

  return data;
}

export async function getPaymentsOverviewData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (timeFrame === "yearly") {
    return {
      received: [
        { x: 2020, y: 450 },
        { x: 2021, y: 620 },
        { x: 2022, y: 780 },
        { x: 2023, y: 920 },
        { x: 2024, y: 1080 },
      ],
      due: [
        { x: 2020, y: 1480 },
        { x: 2021, y: 1720 },
        { x: 2022, y: 1950 },
        { x: 2023, y: 2300 },
        { x: 2024, y: 1200 },
      ],
    };
  }

    return {
      received: [
        { x: "1月", y: 0 },
        { x: "2月", y: 20 },
        { x: "3月", y: 35 },
        { x: "4月", y: 45 },
        { x: "5月", y: 35 },
        { x: "6月", y: 55 },
        { x: "7月", y: 65 },
        { x: "8月", y: 50 },
        { x: "9月", y: 65 },
        { x: "10月", y: 75 },
        { x: "11月", y: 60 },
        { x: "12月", y: 75 },
      ],
      due: [
        { x: "1月", y: 15 },
        { x: "2月", y: 9 },
        { x: "3月", y: 17 },
        { x: "4月", y: 32 },
        { x: "5月", y: 25 },
        { x: "6月", y: 68 },
        { x: "7月", y: 80 },
        { x: "8月", y: 68 },
        { x: "9月", y: 84 },
        { x: "10月", y: 94 },
        { x: "11月", y: 74 },
        { x: "12月", y: 62 },
      ],
    };
  }

export async function getWeeksProfitData(timeFrame?: string) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (timeFrame === "last week") {
    return {
      sales: [
        { x: "周六", y: 33 },
        { x: "周日", y: 44 },
        { x: "周一", y: 31 },
        { x: "周二", y: 57 },
        { x: "周三", y: 12 },
        { x: "周四", y: 33 },
        { x: "周五", y: 55 },
      ],
      revenue: [
        { x: "周六", y: 10 },
        { x: "周日", y: 20 },
        { x: "周一", y: 17 },
        { x: "周二", y: 7 },
        { x: "周三", y: 10 },
        { x: "周四", y: 23 },
        { x: "周五", y: 13 },
      ],
    };
  }

  return {
    sales: [
      { x: "周六", y: 44 },
      { x: "周日", y: 55 },
      { x: "周一", y: 41 },
      { x: "周二", y: 67 },
      { x: "周三", y: 22 },
      { x: "周四", y: 43 },
      { x: "周五", y: 65 },
    ],
    revenue: [
      { x: "周六", y: 13 },
      { x: "周日", y: 23 },
      { x: "周一", y: 20 },
      { x: "周二", y: 8 },
      { x: "周三", y: 13 },
      { x: "周四", y: 27 },
      { x: "周五", y: 15 },
    ],
  };
}

export async function getCampaignVisitorsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    total_visitors: 784_000,
    performance: -1.5,
    chart: [
      { x: "S", y: 168 },
      { x: "S", y: 385 },
      { x: "M", y: 201 },
      { x: "T", y: 298 },
      { x: "W", y: 187 },
      { x: "T", y: 195 },
      { x: "F", y: 291 },
    ],
  };
}

export async function getVisitorsAnalyticsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112, 123, 212, 270,
    190, 310, 115, 90, 380, 112, 223, 292, 170, 290, 110, 115, 290, 380, 312,
  ].map((value, index) => ({ x: index + 1 + "", y: value }));
}

export async function getCostsPerInteractionData() {
  return {
    avg_cost: 560.93,
    growth: 2.5,
    chart: [
      {
        name: "Google Ads",
        data: [
          { x: "Sep", y: 15 },
          { x: "Oct", y: 12 },
          { x: "Nov", y: 61 },
          { x: "Dec", y: 118 },
          { x: "Jan", y: 78 },
          { x: "Feb", y: 125 },
          { x: "Mar", y: 165 },
          { x: "Apr", y: 61 },
          { x: "May", y: 183 },
          { x: "Jun", y: 238 },
          { x: "Jul", y: 237 },
          { x: "Aug", y: 235 },
        ],
      },
      {
        name: "Facebook Ads",
        data: [
          { x: "Sep", y: 75 },
          { x: "Oct", y: 77 },
          { x: "Nov", y: 151 },
          { x: "Dec", y: 72 },
          { x: "Jan", y: 7 },
          { x: "Feb", y: 58 },
          { x: "Mar", y: 60 },
          { x: "Apr", y: 185 },
          { x: "May", y: 239 },
          { x: "Jun", y: 135 },
          { x: "Jul", y: 119 },
          { x: "Aug", y: 124 },
        ],
      },
    ],
  };
}
