// filepath: app/admin/payments/parent/[parentId]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Card } from "antd";
// import apiCall from "../../../../components/utils/apiCall"; // Uncomment for real backend

// Mock data functions
const getParents = () => [
  { id: "p1", first_name: "Mohammed", last_name: "Bouchama" },
  { id: "p2", first_name: "Fatima", last_name: "El Idrissi" },
  { id: "p3", first_name: "Ahmed", last_name: "Laarbi" },
];
const getPayments = () => [
  { id: "pi_3N8v2x", parent_id: "p1", amount: 150000, currency: "MAD", status: "succeeded", created: "2025-05-04T09:00:00Z", description: "Frais de scolarité - Amina et Youssef" },
  { id: "pi_4M7u1w", parent_id: "p1", amount: 100000, currency: "MAD", status: "succeeded", created: "2025-05-03T14:30:00Z", description: "Frais de scolarité - Amina" },
  { id: "pi_5L6t0v", parent_id: "p2", amount: 200000, currency: "MAD", status: "failed", created: "2025-05-02T10:15:00Z", description: "Frais de scolarité - Youssef" },
];

export default function ParentPaymentsPage({ params }) {
  const { parentId } = params;
  const router = useRouter();
  const [parent, setParent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch parent details
    const p = getParents().find((p) => p.id === parentId);
    setParent(p);
    // Fetch payments for this parent
    const data = getPayments().filter((pay) => pay.parent_id === parentId /*&& pay.status !== 'refunded'*/);
    setPayments(data);
    // For real API:
    // apiCall('get', `/api/parents/${parentId}/payments`).then(res => setPayments(res));
    setLoading(false);
  }, [parentId]);

  const columns = [
    { title: "Payment ID", dataIndex: "id", key: "id" },
    { title: "Date", dataIndex: "created", key: "created", render: (date) => new Date(date).toLocaleString() },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Amount", dataIndex: "amount", key: "amount", render: (amt, rec) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: rec.currency }).format(amt/100) },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <div className="p-6">
      <Button onClick={() => router.back()} style={{ marginBottom: 16 }}>
        Back
      </Button>
      <h1 className="text-3xl font-bold mb-4">
        Payments for {parent ? `${parent.first_name} ${parent.last_name}` : parentId}
      </h1>
      <Card>
        <Table
          columns={columns}
          dataSource={payments}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
