"use client";
import { useState, useEffect } from "react";
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
  DownloadOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import apiCall from "@/components/utils/apiCall";
import dynamic from "next/dynamic";
import { Card as ShadcnCard } from "@/components/ui/card";
import styled from "styled-components";
import { useSelector } from "react-redux";

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
  overflow-y: auto;
  display: ${(props) => (props.visible ? "block" : "none")};
`;

const FeedbackList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
`;

export default function ParentDashboard({ user }) {
  const [language, setLanguage] = useState("ar");
  const [childrendata, setchildrendata] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [timeRange, setTimeRange] = useState("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [isSidePanelVisible, setIsSidePanelVisible] = useState(true);
  const [avrg, setAvrg] = useState(0);
  const [absencesData, setabsencesData] = useState(0);

  const authToken = useSelector((state) => state.auth.accessToken);
  const parentinfo = useSelector((state) => state.userinfo.userProfile);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await apiCall(
          "get",
          `/api/students/?parent_id=${parentinfo.id}&page=1&per_page=10`,
          null,
          { token: authToken }
        );
        const mappedChildren = result.students.map((child, index) => ({
          ...child,
          staticId: index === 0 ? "s1" : index === 1 ? "s2" : `s${index + 1}`,
        }));
        setchildrendata(mappedChildren);
        console.log(mappedChildren)
        setChildren(mappedChildren.filter((child) => child.is_approved));
        if (mappedChildren.length > 0 && !selectedChild) {
          setSelectedChild(mappedChildren[0].id);
          handleChildSelection(mappedChildren[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (parentinfo.id && authToken) {
      fetchData();
    }
  }, [parentinfo.id, authToken]);

  const handleChildSelection = async (id) => {
    try {
      const resultNotes = await apiCall(
        "get",
        `/api/notes/?student_id=${id}&page=1&per_page=10`,
        null,
        { token: authToken }
      );
      const total = resultNotes.notes.reduce((sum, note) => sum + note.value, 0);
      const average = (total / (resultNotes.notes.length || 1)).toFixed(2);
      setAvrg(average);

      const resultAbsences = await apiCall(
        "get",
        `/api/absences/?student_id=${id}&page=1&per_page=10`,
        null,
        { token: authToken }
      );
      setabsencesData(resultAbsences.absences.length);
    } catch (error) {
      console.error("Error handling child selection:", error);
    }
  };

  const students = [
    {
      id: "s1",
      first_name: "Amina",
      last_name: "Bouchama",
      email: "amina.bouchama@example.dz",
      level_id: null,
      group_id: null,
      is_approved: true,
      docs_url: null,
      is_active: true,
      date_of_birth: "2018-03-15",
      national_id: "1234567890",
      gender: "F",
      enrollment_date: "2024-09-01",
    },
    {
      id: "s2",
      first_name: "Youssef",
      last_name: "Bouchama",
      email: "youssef.bouchama@example.dz",
      level_id: null,
      group_id: null,
      is_approved: true,
      docs_url: null,
      is_active: true,
      date_of_birth: "2016-07-22",
      national_id: "0987654321",
      gender: "M",
      enrollment_date: "2024-09-01",
    },
  ];

  const attendance = {
    s1: {
      "2025-05-01": { status: "present", class_id: 101 },
      "2025-05-02": { status: "late", class_id: 102 },
      "2025-05-03": { status: "absent", class_id: 103 },
      "2025-05-04": { status: "present", class_id: 104 },
      "2025-05-05": { status: "present", class_id: 105 },
    },
    s2: {
      "2025-05-01": { status: "present", class_id: 201 },
      "2025-05-02": { status: "present", class_id: 202 },
      "2025-05-03": { status: "late", class_id: 203 },
      "2025-05-04": { status: "absent", class_id: 204 },
      "2025-05-05": { status: "present", class_id: 205 },
    },
  };

  const marks = {
    s1: {
      math: [
        { date: "2025-04-01", score: 85, max_score: 100 },
        { date: "2025-04-15", score: 90, max_score: 100 },
        { date: "2025-05-01", score: 88, max_score: 100 },
      ],
      science: [
        { date: "2025-04-01", score: 78, max_score: 100 },
        { date: "2025-04-15", score: 82, max_score: 100 },
        { date: "2025-05-01", score: 85, max_score: 100 },
      ],
      english: [
        { date: "2025-04-01", score: 92, max_score: 100 },
        { date: "2025-04-15", score: 95, max_score: 100 },
        { date: "2025-05-01", score: 90, max_score: 100 },
      ],
    },
    s2: {
      math: [
        { date: "2025-04-01", score: 80, max_score: 100 },
        { date: "2025-04-15", score: 85, max_score: 100 },
        { date: "2025-05-01", score: 82, max_score: 100 },
      ],
      science: [
        { date: "2025-04-01", score: 75, max_score: 100 },
        { date: "2025-04-15", score: 80, max_score: 100 },
        { date: "2025-05-01", score: 78, max_score: 100 },
      ],
      english: [
        { date: "2025-04-01", score: 88, max_score: 100 },
        { date: "2025-04-15", score: 90, max_score: 100 },
        { date: "2025-05-01", score: 85, max_score: 100 },
      ],
    },
  };

  const subjects = [
    { id: 1, name: "Math" },
    { id: 2, name: "Science" },
    { id: 3, name: "English" },
  ];

  const feedback = {
    s1: {
      "2025-05-01": {
        teacher_id: 1,
        comment: "Amina is performing well but needs to focus on participation.",
      },
      "2025-05-03": {
        teacher_id: 2,
        comment: "Good progress in Science, keep up the effort!",
      },
    },
    s2: {
      "2025-05-02": {
        teacher_id: 1,
        comment: "Youssef shows great enthusiasm in Math.",
      },
      "2025-05-04": {
        teacher_id: 3,
        comment: "Needs to improve punctuality for classes.",
      },
    },
  };

  const translations = {
    ar: {
      unauthorized: "غير مصرح لك بالوصول إلى هذه الصفحة",
      loading: "جارٍ التحميل...",
      parentDashboard: "لوحة تحكم الوالدين",
      selectStudent: "اختر الطالب",
      keyMetrics: "إحصائيات رئيسية",
      studentInsights: "رؤى الطالب",
      performanceTrends: "اتجاهات الأداء",
      feedbackAndRank: "ملاحظات وترتيب",
      marksAverage: "متوسط الدرجات",
      attendanceRate: "معدل الحضور",
      classesAttended: "الحصص المحضورة",
      classesMissed: "الحصص المتغيب عنها",
      marksDistribution: "توزيع الدرجات",
      attendanceBreakdown: "تفاصيل الحضور",
      attendanceHistory: "سجل الحضور",
      marksTrend: "اتجاه الدرجات",
      teacherFeedback: "ملاحظات المعلم",
      classRank: "ترتيب الفصل",
      upcomingAssignments: "الواجبات القادمة",
      noFeedback: "لا توجد ملاحظات",
      noAssignments: "لا توجد واجبات قادمة",
      filters: "مرشحات",
      export: "تصدير",
      daily: "يومي",
      weekly: "أسبوعي",
      monthly: "شهري",
      present: "حاضر",
      late: "متأخر",
      absent: "غائب",
      morning: "صباحاً",
      afternoon: "بعد الظهر",
      subject: "المادة",
      score: "الدرجة",
      maxScore: "الحد الأقصى",
      attendanceStatus: "حالة الحضور",
      marksAverageInfo: "متوسط درجات الطالب في جميع المواد",
      attendanceRateInfo: "نسبة حضور الطالب للحصص",
      classesAttendedInfo: "عدد الحصص التي حضرها الطالب",
      classesMissedInfo: "عدد الحصص التي تغيب عنها الطالب",
      studentInsightsInfo: "تحليل الدرجات والحضور",
      performanceTrendsInfo: "سجل الحضور واتجاهات الدرجات",
      feedbackAndRankInfo: "ملاحظات المعلم وترتيب الطالب",
      exportSuccess: "تم تصدير CSV بنجاح!",
      switchLanguage: "Français",
      showAssignments: "إظهار الواجبات",
      hideAssignments: "إخفاء الواجبات",
    },
    fr: {
      unauthorized: "Vous n’êtes pas autorisé à accéder à cette page",
      loading: "Chargement...",
      parentDashboard: "Tableau de bord des parents",
      selectStudent: "Sélectionner l’élève",
      keyMetrics: "Métriques clés",
      studentInsights: "Aperçus de l’élève",
      performanceTrends: "Tendances de performance",
      feedbackAndRank: "Commentaires et classement",
      marksAverage: "Moyenne des notes",
      attendanceRate: "Taux de présence",
      classesAttended: "Cours suivis",
      classesMissed: "Cours manqués",
      marksDistribution: "Distribution des notes",
      attendanceBreakdown: "Détails de la présence",
      attendanceHistory: "Historique de présence",
      marksTrend: "Tendance des notes",
      teacherFeedback: "Commentaires des enseignants",
      classRank: "Classement de la classe",
      upcomingAssignments: "Devoirs à venir",
      noFeedback: "Aucun commentaire",
      noAssignments: "Aucun devoir à venir",
      filters: "Filtres",
      export: "Exporter",
      daily: "Quotidien",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",
      present: "Présent",
      late: "En retard",
      absent: "Absent",
      morning: "Matin",
      afternoon: "Après-midi",
      subject: "Matière",
      score: "Note",
      maxScore: "Note maximale",
      attendanceStatus: "Statut de présence",
      marksAverageInfo: "Moyenne des notes de l’élève dans toutes les matières",
      attendanceRateInfo: "Pourcentage de présence de l’élève aux cours",
      classesAttendedInfo: "Nombre de cours suivis par l’élève",
      classesMissedInfo: "Nombre de cours manqués par l’élève",
      studentInsightsInfo: "Analyse des notes et de la présence",
      performanceTrendsInfo: "Historique de présence et tendances des notes",
      feedbackAndRankInfo: "Commentaires des enseignants et classement de l’élève",
      exportSuccess: "Exportation CSV réussie !",
      switchLanguage: "العربية",
      showAssignments: "Afficher les devoirs",
      hideAssignments: "Masquer les devoirs",
    },
  };

  const t = translations[language];

  const childAttendance = selectedChild ? attendance[childrendata.find((child) => child.id === selectedChild)?.staticId] || {} : {};
  const childMarks = selectedChild ? marks[childrendata.find((child) => child.id === selectedChild)?.staticId] || {} : {};
  const childFeedback = selectedChild ? feedback[childrendata.find((child) => child.id === selectedChild)?.staticId] || {} : {};

  const statsData = [
    {
      name: t.marksAverage,
      value: avrg,
      suffix: "",
      color: "#1890ff",
      info: t.marksAverageInfo,
    },
    {
      name: t.attendanceRate,
      value: childAttendance
        ? (
            (Object.values(childAttendance).filter((a) => a.status === "present").length /
              (Object.values(childAttendance).length || 1)) *
            100
          ).toFixed(1)
        : 0,
      suffix: "%",
      color: "#52c41a",
      info: t.attendanceRateInfo,
    },
    {
      name: t.classesAttended,
      value: childAttendance
        ? Object.values(childAttendance).filter((a) => a.status === "present").length
        : 0,
      color: "#fa8c16",
      info: t.classesAttendedInfo,
    },
    {
      name: t.classesMissed,
      value: absencesData,
      color: "#f5222d",
      info: t.classesMissedInfo,
    },
  ];

  const barOptions = {
    chart: {
      id: "marks-distribution",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    xaxis: { categories: subjects.map((s) => s.name) },
    colors: ["#0771CB"],
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
      formatter: (val) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${val.toFixed(1)}%` },
    },
    grid: { borderColor: "#e8e8e8" },
  };
  const barSeries = [
    {
      name: t.marksAverage,
      data: subjects.map((s) =>
        childMarks[s.name.toLowerCase()]
          ? (
              childMarks[s.name.toLowerCase()].reduce(
                (sum, m) => sum + (m.score / m.max_score) * 100,
                0
              ) / childMarks[s.name.toLowerCase()].length
            ).toFixed(1)
          : 0
      ),
    },
  ];

  const donutOptions = {
    chart: {
      id: "attendance-breakdown",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    labels: [t.present, t.late, t.absent],
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
  const donutSeries = [
    childAttendance
      ? Object.values(childAttendance).filter((a) => a.status === "present").length
      : 0,
    childAttendance
      ? Object.values(childAttendance).filter((a) => a.status === "late").length
      : 0,
    childAttendance
      ? Object.values(childAttendance).filter((a) => a.status === "absent").length
      : 0,
  ];

  const heatmapOptions = {
    chart: {
      id: "attendance-history",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    dataLabels: { enabled: true, style: { colors: ["#fff"] } },
    colors: ["#0771CB"],
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: "#f5222d" },
            { from: 1, to: 1, color: "#fa8c16" },
            { from: 2, to: 2, color: "#52c41a" },
          ],
        },
      },
    },
    xaxis: {
      categories:
        timeRange === "daily"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri"]
          : timeRange === "weekly"
          ? ["Week 1", "Week 2", "Week 3", "Week 4"]
          : ["Jan", "Feb", "Mar", "Apr", "May"],
    },
    yaxis: { categories: ["Morning", "Afternoon"] },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val) =>
          val === 2 ? t.present : val === 1 ? t.late : t.absent,
      },
    },
  };
  const heatmapSeries = [
    {
      name: t.morning,
      data: [2, 1, 0, 2, timeRange === "daily" ? 1 : 2],
    },
    {
      name: t.afternoon,
      data: [1, 2, 2, 0, timeRange === "daily" ? 0 : 1],
    },
  ];

  const lineOptions = {
    chart: {
      id: "marks-trend",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true, easing: "easeinout", speed: 800 },
    },
    xaxis: {
      categories:
        timeRange === "daily"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri"]
          : timeRange === "weekly"
          ? ["Week 1", "Week 2", "Week 3", "Week 4"]
          : ["Jan", "Feb", "Mar", "Apr", "May"],
    },
    colors: ["#0771CB", "#52c41a", "#fa8c16"],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    tooltip: { theme: "light", y: { formatter: (val) => `${val}%` } },
    grid: { borderColor: "#e8e8e8", strokeDashArray: 4 },
    legend: { position: "top", horizontalAlign: "left", fontSize: "14px" },
    markers: { size: 4, strokeWidth: 2, strokeColors: "#fff" },
  };
  const lineSeries = subjects.map((s) => ({
    name: s.name,
    data:
      timeRange === "daily"
        ? [85, 87, 90, 88, 86]
        : timeRange === "weekly"
        ? [86, 88, 89, 90]
        : [80, 82, 85, 87, 90],
  }));

  const radialOptions = {
    chart: {
      id: "class-rank",
      toolbar: { show: true, tools: { download: true } },
      animations: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: { fontSize: "16px", color: "#333", offsetY: 120 },
          value: {
            offsetY: 76,
            fontSize: "22px",
            color: "#0771CB",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#52c41a"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: { dashArray: 4 },
    labels: [t.classRank],
  };
  const radialSeries = [85];

  const exportCSV = () => {
    const headers = [
      t.language === "ar" ? "التاريخ" : "Date",
      t.subject,
      t.score,
      t.maxScore,
      t.attendanceStatus,
    ];
    const rows = [];
    Object.keys(childMarks).forEach((subject) => {
      childMarks[subject].forEach((m) => {
        rows.push([
          m.date,
          subject.charAt(0).toUpperCase() + subject.slice(1),
          m.score,
          m.max_score,
          childAttendance[m.date]?.status || "N/A",
        ]);
      });
    });
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_${selectedChild}_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert(t.exportSuccess);
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "fr" : "ar");
  };

  const toggleSidePanel = () => {
    setIsSidePanelVisible(!isSidePanelVisible);
  };

  if (isLoading || (user && user.role !== "parent")) {
    return <div className="p-6 text-center text-text">{t.loading}</div>;
  }

  return (
    <div
      style={{ padding: "0 16px" }}
      dir={language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-100 font-inter"
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <StyledHeader>{t.parentDashboard}</StyledHeader>
        </Col>
        <Col>
          <Space size="middle">
            <Select
              value={selectedChild}
              onChange={(childId) => {
                setSelectedChild(childId);
                handleChildSelection(childId);
              }}
              style={{ width: 200 }}
              placeholder={t.selectStudent}
            >
              {children.map((child) => (
                <Select.Option key={child.id} value={child.id}>
                  {child.first_name} {child.last_name}
                </Select.Option>
              ))}
            </Select>
           
            
            
            <Button icon={<GlobalOutlined />} onClick={toggleLanguage}>
              {t.switchLanguage}
            </Button>
           
          </Space>
        </Col>
      </Row>

      <StyledSection>
        <StyledSubHeader>
          {t.keyMetrics}
          <Tooltip title={t.marksAverageInfo}>
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </StyledSubHeader>
        <HeroChart>
          <Row gutter={[16, 16]}>
            {statsData.map((stat) => (
              <Col xs={24} sm={12} md={6} key={stat.name}>
                <AntCard
                  hoverable
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e8e8e8",
                    background: "#F5F5F5",
                  }}
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
                    suffix={stat.suffix}
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
        </HeroChart>
      </StyledSection>

      <StyledSection>
        <StyledSubHeader>
          {t.studentInsights}
          <Tooltip title={t.studentInsightsInfo}>
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </StyledSubHeader>
        <MasonryGrid>
          <MasonryItem>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>
              {t.marksDistribution}
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
              {t.attendanceBreakdown}
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

      <StyledSection>
        <StyledSubHeader>
          {t.performanceTrends}
          <Tooltip title={t.performanceTrendsInfo}>
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </StyledSubHeader>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: t.attendanceHistory,
              children: (
                <ShadcnCard
                  style={{
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    padding: "16px",
                    background: "#F5F5F5",
                  }}
                >
                  <Chart
                    options={heatmapOptions}
                    series={heatmapSeries}
                    type="heatmap"
                    height={300}
                  />
                </ShadcnCard>
              ),
            },
            {
              key: "2",
              label: t.marksTrend,
              children: (
                <ShadcnCard
                  style={{
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    padding: "16px",
                    background: "#F5F5F5",
                  }}
                >
                  <Chart
                    options={lineOptions}
                    series={lineSeries}
                    type="line"
                    height={300}
                  />
                </ShadcnCard>
              ),
            },
          ]}
        />
      </StyledSection>

      <StyledSection>
        <StyledSubHeader>
          {t.feedbackAndRank}
          <Tooltip title={t.feedbackAndRankInfo}>
            <InfoCircleOutlined style={{ color: "#888" }} />
          </Tooltip>
        </StyledSubHeader>
        <CircularCluster>
          <CircularCard>
            <FeedbackList>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>
                {t.teacherFeedback}
              </h3>
              {Object.entries(childFeedback).length > 0 ? (
                Object.entries(childFeedback).map(([date, fb]) => (
                  <div
                    key={date}
                    style={{
                      marginBottom: 8,
                      padding: 8,
                      borderBottom: "1px solid #e8e8e8",
                    }}
                  >
                    <p style={{ fontSize: "0.9rem", color: "#555" }}>{date}</p>
                    <p style={{ fontSize: "0.95rem", color: "#333" }}>
                      {fb.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: "#888", textAlign: "center" }}>
                  {t.noFeedback}
                </p>
              )}
            </FeedbackList>
          </CircularCard>
          <CircularCard>
            <Chart
              options={radialOptions}
              series={radialSeries}
              type="radialBar"
              height={300}
            />
          </CircularCard>
        </CircularCluster>
      </StyledSection>
    </div>
  );
}