"use client";

import { useEffect, useState } from "react";
import { Table, Button, Tag, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import apiCall from "../../../components/utils/apiCall";

export default function Payments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useSelector((state) => state.auth.accessToken);

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // Filters from URL
  const parentIdFilter = searchParams.get("parent_id") || null;
  const statusFilter = searchParams.get("status") || null;

  const fetchPayments = async (page = 1, perPage = 10) => {
    setLoading(true);
    try {
      let query = `/api/fees/?page=${page}&per_page=${perPage}`;
      if (parentIdFilter) query += `&parent_id=${parentIdFilter}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const res = await apiCall("get", query, null, { token });

      // Expected: res = { data: [...], total: number }
      setData(res.fees || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: perPage,
        total: res.total || 0,
      }));
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPayments(pagination.current, pagination.pageSize);
    }
  }, [token, parentIdFilter, statusFilter]);

  const handleTableChange = (pagination) => {
    fetchPayments(pagination.current, pagination.pageSize);
  };

  const statusColor = {
    succeeded: "green",
    unpaid: "red",
    failed: "volcano",
    pending: "orange",
  };

  const columns = [
    {
      title: "Parent",
      dataIndex: "parent_name",
      key: "parent_name",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) =>
        new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "MAD",
        }).format(amount),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
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
      title: "Actions",
      key: "actions",
      render: (_, rec) => (
        <Button
          type="link"
          onClick={() => router.push(`/admin/payments/parent/${rec.parent_id}`)}
        >
          View Parent Payments
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Fees & Payments</h1>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        onChange={handleTableChange}
        bordered
      />
    </div>
  );
}
