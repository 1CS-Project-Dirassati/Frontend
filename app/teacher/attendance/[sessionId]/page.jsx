"use client"
import React, { useState, useEffect } from "react";
import { Table, Checkbox, Button, message, Card, Spin, Alert } from "antd";
import { useParams, useRouter } from "next/navigation";
import apiCall from "../../../../components/utils/apiCall";
import { useSelector } from "react-redux";

const TeacherAttendancePage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId;
  const token = useSelector((state) => state.auth.accessToken);
  const teacherId = useSelector((state) => state.userinfo.userProfile.id);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  console.log("hhhhhhhhhhhhh")

  // Fetch session data and students
  useEffect(() => {
    const fetchData = async () => {
      console.log(sessionId, token, teacherId)
      if (!sessionId || !token || !teacherId) {
        console.log("oooooooooooooooo")
        return};
      
      try {
        console.log("qqqqqqqqqqqq")
        setLoading(true);
        // Fetch session data to get group_id and validate teacher
        const {session:sessionResponse} = await apiCall("get", `/api/sessions/${sessionId}`, null, { token });
        console.log(sessionResponse)
        
        // Validate that the session belongs to the current teacher
        console.log("zakizakiazkaiza")
        console.log(sessionResponse.teacher_id, teacherId)
        console.log(sessionResponse.teacher_id !== teacherId)

        if (sessionResponse.teacher_id !== teacherId) {
          setError("You are not authorized to take attendance for this session");
          message.error("Unauthorized access");
          router.push("/teacher/schedule");
          return;
        }
        
        setSessionData(sessionResponse);
        
        // Fetch students for the group
        const studentsResponse = await apiCall(
          "get", 
          `/api/students/?group_id=${sessionResponse.group_id}`, 
          null, 
          { token }
        );
        
        // Initialize students with present status
        const studentsList = Array.isArray(studentsResponse) ? studentsResponse : studentsResponse.students || [];
        setStudents(studentsList.map(student => ({
          ...student,
          present: true // Default to present
        })));
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
        message.error("Failed to load session data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, token, teacherId, router]);

  const handleAttendanceChange = (studentId, isPresent) => {
    setStudents(prev =>
      prev.map(student => 
        student.id === studentId ? { ...student, present: isPresent } : student
      )
    );
  };

  const handleSubmit = async () => {
    if (!sessionId || !token) return;

    try {
      setSubmitting(true);
      const absentStudents = students.filter(student => !student.present);
      
      if (absentStudents.length === 0) {
        message.info("All students are marked as present");
        router.push("/teacher/schedule");
        return;
      }
      
      // Create absence records for absent students
      const absencePromises = absentStudents.map(student => 
        apiCall("post", "/api/absences/", {
          student_id: student.id,
          session_id: parseInt(sessionId),
          justified: false,
          reason: "not mentionned"
        }, { token })
      );

      await Promise.all(absencePromises);
      
      message.success("Attendance recorded successfully");
      router.push("/teacher/schedule"); // Redirect back to schedule
    } catch (err) {
      console.error("Error submitting attendance:", err);
      message.error("Failed to record attendance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'first_name',
      key: 'name',
      render: (text, record) => `${record.first_name} ${record.last_name}`
    },
    {
      title: 'Student ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Present',
      key: 'present',
      render: (_, record) => (
        <Checkbox
          checked={record.present}
          onChange={(e) => handleAttendanceChange(record.id, e.target.checked)}
        />
      )
    }
  ];

  return (
    <div className="p-6">
      <Card title="Session Attendance" className="shadow-lg">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">
            {sessionData?.module_name || 'Session Details'}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <div>
              <p><span className="font-medium">Date:</span> {new Date(sessionData?.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Time:</span> {sessionData?.time_slot}</p>
              <p><span className="font-medium">Room:</span> {sessionData?.salle_name}</p>
            </div>
            <div>
              <p><span className="font-medium">Group:</span> {sessionData?.group_name}</p>
              <p><span className="font-medium">Total Students:</span> {students.length}</p>
            </div>
          </div>
        </div>

        <Table
          dataSource={students}
          columns={columns}
          rowKey="id"
          pagination={false}
          className="mb-4"
        />

        <div className="flex justify-between items-center">
          <Button
            onClick={() => router.push("/teacher/schedule")}
            className="mr-2"
          >
            Back to Schedule
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit Attendance
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TeacherAttendancePage; 