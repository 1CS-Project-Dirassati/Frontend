"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Card, Tag, message } from "antd";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import apiCall from "@/components/utils/apiCall";


export default function ParentPaymentsPage({ params }) {
  const { parentId } = params;
  const router = useRouter();
  const token = useSelector((state) => state.auth.accessToken);

  const [payments, setPayments] = useState([]);
  const [parentName, setParentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchParentPayments();
  }, [token, parentId]);

  const fetchParentPayments = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        "get",
        `/api/fees/?parent_id=${parentId}&per_page=100&page=1`,
        null,
        { token }
      );

      setPayments(response.fees || []);

      if (response.data?.[0]?.parent_name) {
        setParentName(response.data[0].parent_name);
      } else {
        setParentName(`Parent ID: ${parentId}`);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load parent payments");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    succeeded: "green",
    unpaid: "red",
    failed: "volcano",
    pending: "orange",
  };

  const columns = [
    {
      title: "Payment ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Amount (MAD)",
      dataIndex: "amount",
      key: "amount",
      render: (amt) =>
        new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "MAD",
        }).format(amt),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColor[status] || "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    
  ];

  return (
    <div className="p-6">
      <Button onClick={() => router.back()} style={{ marginBottom: 16 }}>
        Back
      </Button>
      <h1 className="text-3xl font-bold mb-4">Payments for {parentName}</h1>
      <Card>
        <Table
          columns={columns}
          dataSource={payments}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Card>
    </div>
  );
}
