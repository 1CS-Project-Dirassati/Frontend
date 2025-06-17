"use client";

import { useState } from "react";
import { Table, Dropdown, Button, Form } from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Button as ShadcnButton } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input as ShadcnInput } from "@/components/ui/input";

// Mock data functions
const getParents = () => [
  {
    id: "p1",
    first_name: "Mohammed",
    last_name: "Bouchama",
    email: "mohammed.bouchama@example.com",
    phone_number: "+212 600 123 456",
    address: "123 Avenue Mohammed V, Casablanca, Maroc",
  },
  {
    id: "p2",
    first_name: "Fatima",
    last_name: "El Idrissi",
    email: "fatima.elidrissi@example.com",
    phone_number: "+212 600 789 012",
    address: "456 Rue Hassan II, Rabat, Maroc",
  },
  {
    id: "p3",
    first_name: "Ahmed",
    last_name: "Laarbi",
    email: "ahmed.laarbi@example.com",
    phone_number: "+212 600 345 678",
    address: "789 Boulevard Zerktouni, Marrakech, Maroc",
  },
];

const getPayments = () => [
  {
    id: "pi_3N8v2xK9jL2mPqR",
    parent_id: "p1",
    amount: 150000, // 1500.00 MAD
    currency: "MAD",
    status: "succeeded",
    created: "2025-05-04T09:00:00Z",
    payment_method: { type: "card", brand: "visa", last4: "1234" },
    description: "Frais de scolarité - Amina et Youssef",
    student_ids: ["s1", "s2"],
    invoice_id: "in_1N8v2xK9jL2mPqR",
    frequency: "annual",
    tax_rate: 20,
    notes: "Paiement des frais annuels pour l'année scolaire 2025-2026.",
  },
  {
    id: "pi_4M7u1wJ8iK1nOpQ",
    parent_id: "p1",
    amount: 100000, // 1000.00 MAD
    currency: "MAD",
    status: "succeeded",
    created: "2025-05-03T14:30:00Z",
    payment_method: { type: "card", brand: "mastercard", last4: "5678" },
    description: "Frais de scolarité - Amina",
    student_ids: ["s1"],
    invoice_id: "in_4M7u1wJ8iK1nOpQ",
    frequency: "trimestrial",
    tax_rate: 20,
    notes: "Paiement trimestriel pour le 2ème trimestre 2025.",
  },
  {
    id: "pi_5L6t0vI7hJ0mNpP",
    parent_id: "p2",
    amount: 200000, // 2000.00 MAD
    currency: "MAD",
    status: "failed",
    created: "2025-05-02T10:15:00Z",
    payment_method: { type: "card", brand: "visa", last4: "1234" },
    description: "Frais de scolarité - Youssef",
    student_ids: ["s3"],
    invoice_id: "in_5L6t0vI7hJ0mNpP",
    frequency: "monthly",
    tax_rate: 20,
    notes:
      "Tentative de paiement mensuel pour mai 2025, échouée en raison d'une carte refusée.",
  },
  {
    id: "pi_6K5s9uH6gI9lMoO",
    parent_id: "p3",
    amount: 80000, // 800.00 MAD
    currency: "MAD",
    status: "refunded",
    created: "2025-05-01T16:45:00Z",
    payment_method: { type: "card", brand: "visa", last4: "1234" },
    description: "Frais de scolarité - Sara",
    student_ids: ["s4"],
    invoice_id: "in_6K5s9uH6gI9lMoO",
    frequency: "annual",
    tax_rate: 20,
    notes: "Remboursé en raison d'un double paiement détecté.",
  },
];

const updateParent = (id, values) => {
  const parents = getParents();
  const index = parents.findIndex((p) => p.id === id);
  if (index !== -1) {
    parents[index] = { ...parents[index], ...values };
  }
  // In a real app, save to storage or API
};

const deleteParent = (id) => {
  // In a real app, remove from storage or API
};

export default function AdminPayments() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [data, setData] = useState(getParents());
  const router = useRouter();

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amount / 100);
  };

  const getParentPaymentSummary = (parentId) => {
    const payments = getPayments().filter((p) => p.parent_id === parentId);
    return {
      total_paid: payments
        .filter((p) => p.status === "succeeded")
        .reduce((sum, p) => sum + p.amount, 0),
      total_pending: payments
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + p.amount, 0),
      total_refunded: payments
        .filter((p) => p.status === "refunded")
        .reduce((sum, p) => sum + p.amount, 0),
    };
  };

  const actionMenu = (record) => ({
    items: [
      {
        key: "view_payments",
        label: (
          <span>
            <EyeOutlined className="mr-2" />
            Voir les paiements
          </span>
        ),
        onClick: () => router.push(`/admin/payments/parent/${record.id}`),
      },
      {
        key: "edit",
        label: (
          <span>
            <EditOutlined className="mr-2" />
            Modifier
          </span>
        ),
        onClick: () => {
          setEditingParent(record);
          form.setFieldsValue(record);
          setIsModalOpen(true);
        },
      },
      {
        key: "delete",
        label: (
          <span>
            <DeleteOutlined className="mr-2" />
            Supprimer
          </span>
        ),
        onClick: () => {
          deleteParent(record.id);
          setData(getParents());
        },
      },
    ],
  });

  const columns = [
    {
      title: "Nom",
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
      sorter: (a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`
        ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Téléphone", dataIndex: "phone_number", key: "phone_number" },
    {
      title: "Total payé",
      key: "total_paid",
      render: (_, record) => {
        const summary = getParentPaymentSummary(record.id);
        return formatAmount(summary.total_paid, "MAD");
      },
    },
    {
      title: "Total en attente",
      key: "total_pending",
      render: (_, record) => {
        const summary = getParentPaymentSummary(record.id);
        return formatAmount(summary.total_pending, "MAD");
      },
    },
    {
      title: "Total remboursé",
      key: "total_refunded",
      render: (_, record) => {
        const summary = getParentPaymentSummary(record.id);
        return formatAmount(summary.total_refunded, "MAD");
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Dropdown
          menu={actionMenu(record)}
          trigger={["click"]}
          overlayClassName="shadow-md rounded-md"
        >
          <Button
            icon={<MoreOutlined />}
            className="border-border hover:bg-secondary hover:text-text"
          />
        </Dropdown>
      ),
    },
  ];

  const handleOk = () => {
    form.validateFields().then((values) => {
      updateParent(editingParent.id, values);
      setData(getParents());
      setIsModalOpen(false);
      form.resetFields();
      setEditingParent(null);
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingParent(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-text">
        Gestion des paiements des parents
      </h1>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        bordered
        className="shadow-md bg-background rounded-lg"
        rowClassName="hover:bg-accent/10"
      />

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-background text-text rounded-lg">
          <DialogHeader>
            <DialogTitle>Modifier le parent</DialogTitle>
          </DialogHeader>
          <Form form={form} layout="vertical" className="space-y-4">
            <Form.Item
              name="first_name"
              label="Prénom"
              rules={[{ required: true, message: "Veuillez entrer le prénom" }]}
            >
              <ShadcnInput className="border-border" />
            </Form.Item>
            <Form.Item
              name="last_name"
              label="Nom"
              rules={[{ required: true, message: "Veuillez entrer le nom" }]}
            >
              <ShadcnInput className="border-border" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Veuillez entrer un email valide",
                },
              ]}
            >
              <ShadcnInput className="border-border" />
            </Form.Item>
            <Form.Item
              name="phone_number"
              label="Téléphone"
              rules={[
                {
                  required: true,
                  message: "Veuillez entrer un numéro de téléphone",
                },
              ]}
            >
              <ShadcnInput className="border-border" />
            </Form.Item>
            <Form.Item name="address" label="Adresse">
              <ShadcnInput className="border-border" />
            </Form.Item>
            <div className="flex gap-2 justify-end">
              <ShadcnButton
                variant="outline"
                onClick={handleCancel}
                className="border-border hover:bg-accent"
              >
                Annuler
              </ShadcnButton>
              <ShadcnButton
                onClick={handleOk}
                className="bg-secondary hover:bg-accent text-background"
              >
                Enregistrer
              </ShadcnButton>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
