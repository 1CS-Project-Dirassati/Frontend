"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Card as AntCard,
  Col,
  Row,
  Statistic,
  Button,
  Select,
  Space,
  Tooltip,
  Tabs,
} from "antd";
import {
  FilterOutlined,
  ZoomInOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import { Card as ShadcnCard } from "@/components/ui/card";
import styled from "styled-components";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const StyledSection = styled.div`
  margin-bottom: 32px;
  position: relative;
`;

const StyledHeader = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1a1a1a;
`;

const StyledSubHeader = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeroChart = styled(ShadcnCard)`
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 24px;
  background: linear-gradient(135deg, #ffffff, #f0faff);
`;

const OverlapStat = styled(AntCard)`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
`;

const MasonryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  grid-auto-rows: minmax(200px, auto);
  grid-auto-flow: dense;
`;

const MasonryItem = styled(ShadcnCard)`
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  &:nth-child(odd) {
    grid-row: span 2;
  }
`;

const CircularCluster = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  position: relative;
`;

const CircularCard = styled(ShadcnCard)`
  border-radius: 50%;
  width: 350px;
  height: 350px;
  padding: 20px;
  background: linear-gradient(45deg, #fafafa, #ffffff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SidePanel = styled(ShadcnCard)`
  width: 300px;
  height: 600px;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  right: 16px;
  top: 100px;
`;

export default function Home() {
  const permision = useSelector((state) => state.auth.role);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState(
    searchParams.get("timeRange") || "monthly"
  );

  const statsData = [
    {
      name: "Total Students",
      value: 1200,
      change: "+5%",
      color: "#1890ff",
      info: "Total enrolled students this term",
    },
    {
      name: "Total Parents",
      value: 800,
      change: "+3%",
      color: "#52c41a",
      info: "Active parent accounts linked",
    },
    {
      name: "Active Sessions",
      value: 45,
      change: "-2%",
      color: "#fa8c16",
      info: "Classes currently in progress",
    },
    {
      name: "Attendance Rate",
      value: 92,
      suffix: "%",
      color: "#722ed1",
      info: "Average daily attendance",
    },
  ];

  const getAreaSeries = () => {
    switch (timeRange) {
      case "daily":
        return [
          { name: "Students", data: [50, 52, 53, 55, 56, 57] },
          { name: "Sessions", data: [2, 3, 3, 4, 4, 5] },
        ];
      case "weekly":
        return [
          { name: "Students", data: [300, 310, 320, 330, 340, 350] },
          { name: "Sessions", data: [10, 12, 15, 17, 18, 20] },
        ];
      default:
        return [
          { name: "Students", data: [1100, 1120, 1150, 1200, 1220, 1250] },
          { name: "Sessions", data: [30, 35, 40, 45, 48, 50] },
        ];
    }
  };

  const areaOptions = {
    chart: {
      id: "enrollment-trends",
      toolbar: {
        show: true,
        tools: { download: true, zoom: true, pan: true, reset: true },
      },
      animations: { enabled: true, easing: "easeinout", speed: 800 },
    },
    xaxis: {
      categories:
        timeRange === "daily"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
    colors: ["#1890ff", "#52c41a"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 },
    },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    tooltip: { theme: "light", y: { formatter: (val) => `${val}` } },
    grid: { borderColor: "#e8e8e8", strokeDashArray: 4 },
    legend: { position: "top", horizontalAlign: "left", fontSize: "14px" },
    markers: { size: 4, strokeWidth: 2, strokeColors: "#fff" },
  };
  const areaSeries = getAreaSeries();

  const barOptions = {
    chart: {
      id: "grade-distribution",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    xaxis: { categories: ["9th", "10th", "11th", "12th"] },
    colors: ["#1890ff"],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "50%",
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { fontSize: "12px", colors: ["#304758"] },
    },
    tooltip: { theme: "light", y: { formatter: (val) => `${val} students` } },
    grid: { borderColor: "#e8e8e8" },
  };
  const barSeries = [{ name: "Students", data: [300, 400, 350, 250] }];

  const donutOptions = {
    chart: {
      id: "attendance",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    labels: ["Present", "Late", "Absent"],
    colors: ["#52c41a", "#fa8c16", "#f5222d"],
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
    legend: { position: "bottom", fontSize: "14px" },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: { show: true, total: { show: true, label: "Total" } },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: { chart: { width: 300 }, legend: { position: "bottom" } },
      },
    ],
  };
  const donutSeries = [88, 7, 5];

  const heatmapOptions = {
    chart: {
      id: "session-heatmap",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    dataLabels: { enabled: true, style: { colors: ["#fff"] } },
    colors: ["#1890ff"],
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            { from: 0, to: 20, color: "#e6f7ff" },
            { from: 21, to: 50, color: "#1890ff" },
          ],
        },
      },
    },
    xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    yaxis: { categories: ["9 AM", "10 AM", "11 AM", "12 PM"] },
    tooltip: { theme: "light", y: { formatter: (val) => `${val} sessions` } },
  };
  const heatmapSeries = [
    { name: "9 AM", data: [20, 25, 30, 28, 22] },
    { name: "10 AM", data: [35, 40, 45, 42, 38] },
    { name: "11 AM", data: [15, 20, 25, 22, 18] },
    { name: "12 PM", data: [10, 15, 20, 18, 12] },
  ];

  const stackedAreaOptions = {
    chart: {
      id: "demographics",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
      stacked: true,
    },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
    colors: ["#1890ff", "#52c41a", "#fa8c16"],
    fill: { opacity: 0.8 },
    stroke: { width: 1 },
    dataLabels: { enabled: false },
    tooltip: { theme: "light", y: { formatter: (val) => `${val} students` } },
    grid: { borderColor: "#e8e8e8" },
    legend: { position: "top" },
  };
  const stackedAreaSeries = [
    { name: "Male", data: [500, 510, 520, 530, 540, 550] },
    { name: "Female", data: [600, 610, 620, 630, 640, 650] },
    { name: "Other", data: [50, 52, 54, 56, 58, 60] },
  ];

  const candlestickOptions = {
    chart: {
      id: "grade-fluctuations",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
    colors: ["#1890ff", "#f5222d"],
    tooltip: { theme: "light" },
    grid: { borderColor: "#e8e8e8" },
  };
  const candlestickSeries = [
    {
      data: [
        { x: "Jan", y: [80, 85, 78, 82] },
        { x: "Feb", y: [82, 87, 80, 84] },
        { x: "Mar", y: [84, 88, 81, 86] },
        { x: "Apr", y: [86, 90, 83, 88] },
        { x: "May", y: [88, 92, 85, 90] },
        { x: "Jun", y: [90, 94, 87, 92] },
      ],
    },
  ];

  const treemapOptions = {
    chart: {
      id: "resource-allocation",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    colors: ["#1890ff", "#52c41a", "#fa8c16", "#722ed1"],
    dataLabels: { enabled: true, style: { fontSize: "12px" } },
    tooltip: { theme: "light", y: { formatter: (val) => `$${val}k` } },
  };
  const treemapSeries = [
    {
      data: [
        { x: "Academics", y: 500 },
        { x: "Sports", y: 300 },
        { x: "Arts", y: 200 },
        { x: "Facilities", y: 150 },
      ],
    },
  ];

  const polarOptions = {
    chart: {
      id: "feedback-ratings",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    labels: ["Communication", "Support", "Resources", "Events"],
    colors: ["#1890ff", "#52c41a", "#fa8c16", "#722ed1"],
    fill: { opacity: 0.8 },
    stroke: { width: 1 },
    dataLabels: { enabled: true },
    tooltip: { theme: "light", y: { formatter: (val) => `${val}/5` } },
    legend: { position: "bottom" },
  };
  const polarSeries = [4.5, 4.2, 3.8, 4.0];

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    router.push(`/admin_test?timeRange=${value}`);
  };
  if (permision === "teacher") {
   
  
  
  return (
    <div style={{ padding: "0 16px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <StyledHeader>School Dashboard</StyledHeader>
        </Col>
        <Col>
          <Space size="middle">
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
              ]}
              style={{ width: 120 }}
            />
            <Button icon={<FilterOutlined />}>Filters</Button>
            <Button icon={<ZoomInOutlined />}>Zoom</Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              Export
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Hero Section: Area Chart with Overlapping Stat */}
      <StyledSection>
        <StyledSubHeader>
          Key Metrics
          <Tooltip title="Core school performance indicators">
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </StyledSubHeader>
        <Row gutter={[16, 16]}>
          {statsData.map((stat) => (
            <Col xs={24} sm={12} md={6} key={stat.name}>
              <AntCard
                hoverable
                style={{ borderRadius: 8, border: "1px solid #e8e8e8" }}
              >
                <Statistic
                  title={
                    <span>
                      {stat.name}{" "}
                      <Tooltip title={stat.info}>
                        <InfoCircleOutlined
                          style={{ fontSize: "12px", color: "#888" }}
                        />
                      </Tooltip>
                    </span>
                  }
                  value={stat.value}
                  suffix={stat.suffix || stat.change}
                  valueStyle={{
                    color: stat.color,
                    fontSize: "24px",
                    fontWeight: 500,
                  }}
                />
              </AntCard>
            </Col>
          ))}
        </Row>
      </StyledSection>

      <StyledSection>
        <StyledSubHeader>
          Enrollment Trends
          <Tooltip title="Track student and session growth">
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </StyledSubHeader>
        <HeroChart>
          <Chart
            options={areaOptions}
            series={areaSeries}
            type="area"
            height={400}
          />
          {/* <OverlapStat>
            <Statistic
              title="Growth Rate"
              value={5.2}
              suffix="%"
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
            />
          </OverlapStat> */}
        </HeroChart>
      </StyledSection>

      {/* Masonry Grid: Bar and Donut */}
      <StyledSection>
        <StyledSubHeader>
          Student Insights
          <Tooltip title="Grade and attendance analysis">
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </StyledSubHeader>
        <MasonryGrid>
          <MasonryItem>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>
              Grade Distribution
            </h3>
            <Chart
              options={barOptions}
              series={barSeries}
              type="bar"
              height={300}
            />
          </MasonryItem>
          <MasonryItem>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>
              Attendance Breakdown
            </h3>
            <Chart
              options={donutOptions}
              series={donutSeries}
              type="donut"
              height={250}
            />
          </MasonryItem>
        </MasonryGrid>
      </StyledSection>

      {/* Tabbed Carousel: Stacked Area and Candlestick */}
      <StyledSection>
        <StyledSubHeader>
          Performance Trends
          <Tooltip title="Demographics and grades over time">
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </StyledSubHeader>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Demographics",
              children: (
                <ShadcnCard
                  style={{
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    padding: "16px",
                  }}
                >
                  <Chart
                    options={stackedAreaOptions}
                    series={stackedAreaSeries}
                    type="area"
                    height={300}
                  />
                </ShadcnCard>
              ),
            },
            {
              key: "2",
              label: "Grade Fluctuations",
              children: (
                <ShadcnCard
                  style={{
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    padding: "16px",
                  }}
                >
                  <Chart
                    options={candlestickOptions}
                    series={candlestickSeries}
                    type="candlestick"
                    height={300}
                  />
                </ShadcnCard>
              ),
            },
          ]}
        />
      </StyledSection>

      {/* Circular Cluster: Heatmap and Polar Area */}
      <StyledSection>
        <StyledSubHeader>
          Activity & Feedback
          <Tooltip title="Session activity and parent feedback">
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </StyledSubHeader>
        <CircularCluster>
          <CircularCard>
            <Chart
              options={heatmapOptions}
              series={heatmapSeries}
              type="heatmap"
              height={300}
              width={300}
            />
          </CircularCard>
          <CircularCard>
            <Chart
              options={polarOptions}
              series={polarSeries}
              type="polarArea"
              height={300}
              width={300}
            />
          </CircularCard>
        </CircularCluster>
      </StyledSection>

      {/* Side Panel: Treemap */}
      {/* <SidePanel>
        <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>
          Resource Allocation
        </h3>
        <Chart
          options={treemapOptions}
          series={treemapSeries}
          type="treemap"
          height={550}
        />
      </SidePanel> */}
    </div>
  );
}

else{
  router.push("/signin")
}
}