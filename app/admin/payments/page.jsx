// filepath: app/admin/payments/page.jsx
"use client";
import { useState, useEffect } from "react";
import { Table, Button } from "antd";
import { useRouter } from "next/navigation";

// Mock parents data
const getParents = () => [
  {
    id: "p1",
    first_name: "Mohammed",
    last_name: "Bouchama",
    email: "mohammed.bouchama@example.com",
    phone_number: "+212600123456",
  },
  {
    id: "p2",
    first_name: "Fatima",
    last_name: "El Idrissi",
    email: "fatima.elidrissi@example.com",
    phone_number: "+212600789012",
  },
  {
    id: "p3",
    first_name: "Ahmed",
    last_name: "Laarbi",
    email: "ahmed.laarbi@example.com",
    phone_number: "+212600345678",
  },
];

// Mock payments data
const getPayments = () => [
  {
    id: "pi_3N8v2x",
    parent_id: "p1",
    amount: 150000,
    currency: "MAD",
    status: "succeeded",
    created: "2025-05-04T09:00:00Z",
    description: "Frais de scolarité - Amina et Youssef",
  },
  {
    id: "pi_4M7u1w",
    parent_id: "p1",
    amount: 100000,
    currency: "MAD",
    status: "succeeded",
    created: "2025-05-03T14:30:00Z",
    description: "Frais de scolarité - Amina",
  },
  {
    id: "pi_5L6t0v",
    parent_id: "p2",
    amount: 200000,
    currency: "MAD",
    status: "failed",
    created: "2025-05-02T10:15:00Z",
    description: "Frais de scolarité - Youssef",
  },
  // excluded refunded entries
];

export default function Payments() {
  const router = useRouter();
  const [data, setData] = useState([]);

  useEffect(() => {
    const parents = getParents();
    const rows = parents.map((parent) => {
      const payments = getPayments().filter(
        (p) => p.parent_id === parent.id /*&& p.status !== 'refunded'*/
      );
      const totalPaid = payments
        .filter((p) => p.status === "succeeded")
        .reduce((sum, p) => sum + p.amount, 0);
      const currency = payments[0]?.currency || "MAD";
      return {
        key: parent.id,
        ...parent,
        totalPaid,
        currency,
      };
    });
    setData(rows);
  }, []);

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, rec) => `${rec.first_name} ${rec.last_name}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone_number", key: "phone_number" },
    {
      title: "Total Paid",
      key: "total",
      render: (_, rec) =>
        new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: rec.currency,
        }).format(rec.totalPaid / 100),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, rec) => (
        <Button
          type="link"
          onClick={() => router.push(`/admin/payments/parent/${rec.key}`)}
        >
          View Payments
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
