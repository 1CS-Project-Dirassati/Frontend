"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Filter,
  Download,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import apiCall from "@/components/utils/apiCall"; 
import { useDispatch,useSelector } from "react-redux";// Assuming you have an apiCall utility function
import clsx from "clsx";

const stripePromise = loadStripe(
  "pk_test_51RS3zNPq3NiYKo7rr5EALXBIEjXBjObVT9AOOGDK1W16BUcabN4Ej9gyUKAplz0lT2cDBJXzTD3d9Xr1oCal8fN300j4MPdKUH"
);
// Assuming you have a Redux store setup
function PaymentForm({ onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
 
  

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error(error);
    } else {
      console.log("PaymentMethod created:", paymentMethod);
      onPaymentSuccess(paymentMethod);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="text-sm text-slate-600 mb-1 block">
          Détails de la carte
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <Button type="submit" disabled={!stripe} className="mt-4">
        Payer
      </Button>
    </form>
  );
}

export default function ParentPayments({ user }) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [historiqueTransaction,setHistoriqueTransaction] = useState([]);
  const[totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [totalOverdue, setTotalOverdue] = useState(0);

  const paymentsPerPage = 2;
 const authToken = useSelector((state) => state.auth.accessToken);
 console.log(authToken)
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await apiCall("get", "/api/fees/?parent_id=1&page=1&per_page=1", null, {
          token: authToken,
        });

        const fees = response.fees;
        setHistoriqueTransaction(fees)
        const totalPaidtmp = response.total
          .filter((fee) => fee.status === "paid")
          .reduce((sum, fee) => sum + fee.amount, 0);
        const totalUnpaidtmp = fees
          .filter((fee) => fee.status === "unpaid")
          .reduce((sum, fee) => sum + fee.amount, 0);
        const totalOverduetmp = fees
          .filter((fee) => fee.status === "overdue")
          .reduce((sum, fee) => sum + fee.amount, 0);

        setTotalPaid(totalPaidtmp);
        setTotalUnpaid(totalUnpaidtmp);
        setTotalOverdue(totalOverduetmp);
      } catch (error) {
        console.error("Error fetching fees:", error);
      }
    };

    fetchFees();
  }, [authToken]);


  const [paymentForm, setPaymentForm] = useState({
    student_ids: ["s1", "s2"], // Default: Amina and Youssef
    amount: "150000", // 1500.00 DZD in cents
  });

  // Hardcoded students
  const students = [
    { id: "s1", first_name: "Amina", last_name: "Bouchama" },
    { id: "s2", first_name: "Youssef", last_name: "Bouchama" },
  ];

  // Mock school details
  const schoolDetails = {
    name: "École Dirassati",
    address: "Tlemcen, Tlemcen",
    phone: "+213 522 123 456",
    email: "contact@dirassati.dz",
  };

  // initialPayments replaced with historiqueTransaction data
  const initialPayments = historiqueTransaction.map((transaction) => ({
    id: transaction.id,
    amount: transaction.amount, // Amount in DZD
    currency: "DZD",
    status: transaction.status,
    created: transaction.due_date,
    payment_method: {
      type: "card",
      brand: "visa",
      last4: "1234",
    },
    description: transaction.description,
    student_ids: [], // Removed as per requirement
    invoice_id: `in_${transaction.id}`,
    frequency: "annual", // Default value
    tax_rate: 0, // Default VAT
    notes: "",
  }));

  // State for payments
  const [payments, setPayments] = useState(initialPayments);

  // Summary stats
  const [summary, setSummary] = useState({
    total_paid: initialPayments
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + p.amount, 0), // 1500.00 + 1000.00 = 2500.00 DZD
    total_pending: 0,
    total_refunded: initialPayments
      .filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + p.amount, 0), // 800.00 DZD
  });
 

  // Mock filter/sort function
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mock sort function
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "desc"
        ? new Date(b.created) - new Date(a.created)
        : new Date(a.created) - new Date(b.created);
    }
    if (sortBy === "amount") {
      return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage);
  const paginatedPayments = sortedPayments.slice(
    (currentPage - 1) * paymentsPerPage,
    currentPage * paymentsPerPage
  );

  // Format amount
  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amount / 100);
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
    }).format(new Date(date));
  };

  // Handle payment submission
  const handlePayment = () => {
    if (!paymentForm.student_ids.length || !paymentForm.amount) {
      alert("Veuillez sélectionner au moins un élève et entrer un montant.");
      return;
    }

    const newPayment = {
      id: `pi_mock_${Date.now()}`,
      amount: parseInt(paymentForm.amount),
      currency: "DZD",
      status: "succeeded",
      created: new Date().toISOString(),
      payment_method: {
        type: "card",
        brand: "visa",
        last4: "1234",
      },
      description: `Frais de scolarité - ${paymentForm.student_ids
        .map((id) => students.find((s) => s.id === id)?.first_name)
        .join(", ")}`,
      student_ids: paymentForm.student_ids,
      invoice_id: `in_mock_${Date.now()}`,
      frequency: "annual",
      tax_rate: 20,
      notes: "Paiement des frais annuels via le portail parent.",
    };

    setPayments((prev) => [...prev, newPayment]);
    setSummary((prev) => ({
      ...prev,
      total_paid: prev.total_paid + parseInt(paymentForm.amount),
    }));
    setIsPaymentModalOpen(false);
    setPaymentForm({
      student_ids: ["s1", "s2"],
      amount: "150000",
    });
    alert("Paiement simulé avec succès !");
  };

  // Handle view invoice
  const handleViewInvoice = (payment) => {
    setSelectedInvoice(payment);
    setIsInvoiceModalOpen(true);
  };

  const handlePaymentSuccess = (paymentMethod) => {
    alert(`Paiement réussi avec la méthode: ${paymentMethod.id}`);
  };

  if (!authToken) {
    return <div className="p-6 text-center text-slate-800">Chargement...</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="p-4 min-h-screen bg-gradient-to-b from-beige-100 to-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-slate-800"
            >
              Gestion des paiements
            </motion.h1>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-[#0771CB] hover:bg-[#055a9e] text-white rounded-lg"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Nouveau paiement
              </Button>
            </motion.div>
          </div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2}}
          >
            <Card className="bg-white/90 border-slate-300 shadow-xl rounded-xl mb-6">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-slate-600" />
                  Résumé des paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Total payé</p>
                    <p className="text-2xl font-semibold text-[#0771CB]">
                      {formatAmount(totalPaid, "DZD")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Total en attente</p>
                    <p className="text-2xl font-semibold text-slate-800">
                      {formatAmount(totalUnpaid, "DZD")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Total remboursé</p>
                    <p className="text-2xl font-semibold text-slate-800">
                      {formatAmount(totalOverdue, "DZD")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Input
                placeholder="Rechercher par ID de transaction..."
                className="w-full sm:w-64 border-slate-300 rounded-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 border-slate-300 rounded-lg shadow-sm">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="succeeded">Réussi</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                  <SelectItem value="refunded">Remboursé</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-800 hover:bg-slate-100 rounded-lg"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
            <Button
              className="bg-[#0771CB] hover:bg-[#055a9e] text-white rounded-lg"
              onClick={() => alert("Exportation CSV non implémentée")}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter en CSV
            </Button>
          </motion.div>

          {/* Payment Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-white/90 border-slate-300 shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  Historique des transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100 hover:bg-slate-200">
                        <TableHead className="text-slate-800 font-semibold">
                          ID Transaction
                        </TableHead>
                        <TableHead
                          className="text-slate-800 font-semibold cursor-pointer"
                          onClick={() => {
                            setSortBy("date");
                            setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                          }}
                        >
                          Date{" "}
                          {sortBy === "date" &&
                            (sortOrder === "desc" ? (
                              <ChevronDown className="inline w-4 h-4" />
                            ) : (
                              <ChevronUp className="inline w-4 h-4" />
                            ))}
                        </TableHead>
                        <TableHead
                          className="text-slate-800 font-semibold cursor-pointer"
                          onClick={() => {
                            setSortBy("amount");
                            setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                          }}
                        >
                          Montant{" "}
                          {sortBy === "amount" &&
                            (sortOrder === "desc" ? (
                              <ChevronDown className="inline w-4 h-4" />
                            ) : (
                              <ChevronUp className="inline w-4 h-4" />
                            ))}
                        </TableHead>
                        <TableHead className="text-slate-800 font-semibold">
                          Statut
                        </TableHead>
                        <TableHead className="text-slate-800 font-semibold">
                          Méthode
                        </TableHead>
                        <TableHead className="text-slate-800 font-semibold">
                          Élèves
                        </TableHead>
                        <TableHead className="text-slate-800 font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPayments.length > 0 ? (
                        paginatedPayments.map((payment) => (
                          <motion.tr
                            key={payment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="hover:bg-slate-50"
                          >
                            <TableCell className="text-slate-800">
                              {payment.id}
                            </TableCell>
                            <TableCell className="text-slate-800">
                              {formatDate(payment.created)}
                            </TableCell>
                            <TableCell className="text-slate-800">
                              {formatAmount(payment.amount, payment.currency)}
                            </TableCell>
                            <TableCell className="text-slate-800">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  payment.status === "succeeded"
                                    ? "bg-green-100 text-green-800"
                                    : payment.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {payment.status === "succeeded"
                                  ? "Réussi"
                                  : payment.status === "failed"
                                  ? "Échoué"
                                  : "Remboursé"}
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-800">
                              {payment.payment_method.type === "card"
                                ? `${payment.payment_method.brand.toUpperCase()} ****${
                                    payment.payment_method.last4
                                  }`
                                : payment.payment_method.type}
                            </TableCell>
                            <TableCell className="text-slate-800">
                              {payment.student_ids
                                .map((id) => {
                                  const student = students.find(
                                    (s) => s.id === id
                                  );
                                  return student
                                    ? `${student.first_name} ${student.last_name}`
                                    : "";
                                })
                                .join(", ")}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="text-slate-800"
                                  >
                                    <span className="sr-only">Actions</span>
                                    <span className="text-slate-800">...</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => handleViewInvoice(payment)}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Voir la facture
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      alert(
                                        "Demande de remboursement non implémentée"
                                      )
                                    }
                                    disabled={payment.status !== "succeeded"}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Demander un remboursement
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-slate-400"
                          >
                            Aucun paiement trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-slate-600">
                    Affichage de {(currentPage - 1) * paymentsPerPage + 1} à{" "}
                    {Math.min(
                      currentPage * paymentsPerPage,
                      sortedPayments.length
                    )}{" "}
                    sur {sortedPayments.length} paiement(s)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-slate-300 rounded-lg"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-300 rounded-lg"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Modal */}
          <AnimatePresence>
            {isPaymentModalOpen && (
              <Dialog
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
              >
                <DialogContent
                  totalUnpaid={totalUnpaid} // Pass totalUnpaid dynamically to the dialog
                  className="bg-white rounded-lg shadow-xl max-w-md"
                >
                  <DialogHeader>
                    <DialogTitle className="text-slate-800 flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-[#0771CB]" />
                      Nouveau paiement
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Student Selection */}
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">
                        Élèves concernés
                      </label>
                      <Select
                        value={paymentForm.student_ids}
                        onValueChange={(value) =>
                          setPaymentForm({ ...paymentForm, student_ids: value })
                        }
                        multiple
                      >
                        <SelectTrigger className="w-full border-slate-300 rounded-lg shadow-sm">
                          <SelectValue placeholder="Sélectionner les élèves" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.first_name} {student.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Amount */}
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">
                        Montant (DZD)
                      </label>
                      <Input
                        type="number"
                        placeholder="1500.00"
                        className="w-full border-slate-300 rounded-lg shadow-sm"
                        value={totalUnpaid / 100}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            amount: parseInt(e.target.value * 100) || 0,
                          })
                        }
                      />
                    </div>
                    {/* Payment Method */}
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">
                        Méthode de paiement
                      </label>
                      <Select
                        value="card_visa_1234"
                        onValueChange={(value) =>
                          setPaymentForm({
                            ...paymentForm,
                            payment_method: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full border-slate-300 rounded-lg shadow-sm">
                          <SelectValue placeholder="Sélectionner une méthode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card_visa_1234">
                            Visa ****1234
                          </SelectItem>
                          <SelectItem value="new_card">Nouvelle carte</SelectItem>
                        </SelectContent>
                      </Select>
                      {paymentForm.payment_method === "new_card" && (
                        <div className="mt-2 p-3 bg-slate-100 rounded-lg">
                          <p className="text-sm text-slate-600">
                            Numéro de carte
                          </p>
                          <Input
                            placeholder="**** **** **** ****"
                            className="mt-1 border-slate-300 rounded-lg"
                            disabled
                          />
                          <div className="flex gap-2 mt-2">
                            <div>
                              <p className="text-sm text-slate-600">Expiration</p>
                              <Input
                                placeholder="MM/AA"
                                className="mt-1 border-slate-300 rounded-lg"
                                disabled
                              />
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">CVC</p>
                              <Input
                                placeholder="***"
                                className="mt-1 border-slate-300 rounded-lg"
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="border-slate-300 text-slate-800 rounded-lg"
                      onClick={() => setIsPaymentModalOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="bg-[#0771CB] hover:bg-[#055a9e] text-white rounded-lg"
                      onClick={handlePayment}
                    >
                      Payer maintenant
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>

          {/* Invoice Modal */}
          <AnimatePresence>
            {isInvoiceModalOpen && selectedInvoice && (
              <Dialog
                open={isInvoiceModalOpen}
                onOpenChange={setIsInvoiceModalOpen}
              >
                <DialogContent className="bg-white rounded-lg shadow-xl max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-slate-800 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-[#0771CB]" />
                      Facture #{selectedInvoice.invoice_id}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800">
                          {schoolDetails.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {schoolDetails.address}
                        </p>
                        <p className="text-sm text-slate-600">
                          Tél: {schoolDetails.phone}
                        </p>
                        <p className="text-sm text-slate-600">
                          Email: {schoolDetails.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          Date d’émission: {formatDate(selectedInvoice.created)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Facture #: {selectedInvoice.invoice_id}
                        </p>
                      </div>
                    </div>
                    {/* Transaction Info */}
                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">
                        Détails de la transaction
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">ID Transaction</p>
                          <p className="text-slate-800">{selectedInvoice.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Statut</p>
                          <p className="text-slate-800">
                            {selectedInvoice.status === "succeeded"
                              ? "Réussi"
                              : selectedInvoice.status === "failed"
                              ? "Échoué"
                              : "Remboursé"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Fréquence</p>
                          <p className="text-slate-800">
                            {selectedInvoice.frequency === "annual"
                              ? "Annuel"
                              : selectedInvoice.frequency === "trimestrial"
                              ? "Trimestriel"
                              : "Mensuel"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">
                            Méthode de paiement
                          </p>
                          <p className="text-slate-800">
                            {selectedInvoice.payment_method.type === "card"
                              ? `${selectedInvoice.payment_method.brand.toUpperCase()} ****${
                                  selectedInvoice.payment_method.last4
                                }`
                              : selectedInvoice.payment_method.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Élèves</p>
                          <p className="text-slate-800">
                            {selectedInvoice.student_ids
                              .map((id) => {
                                const student = students.find((s) => s.id === id);
                                return student
                                  ? `${student.first_name} ${student.last_name}`
                                  : "";
                              })
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Amount Breakdown */}
                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">
                        Résumé du montant
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-slate-800">
                              Description
                            </TableHead>
                            <TableHead className="text-slate-800 text-right">
                              Montant
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-slate-800">
                              {selectedInvoice.description}
                            </TableCell>
                            <TableCell className="text-slate-800 text-right">
                              {formatAmount(
                                selectedInvoice.amount /
                                  (1 + selectedInvoice.tax_rate / 100),
                                selectedInvoice.currency
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-slate-800">
                              TVA ({selectedInvoice.tax_rate}%)
                            </TableCell>
                            <TableCell className="text-slate-800 text-right">
                              {formatAmount(
                                (selectedInvoice.amount *
                                  selectedInvoice.tax_rate) /
                                  (100 + selectedInvoice.tax_rate),
                                selectedInvoice.currency
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-slate-800 font-semibold">
                              Total
                            </TableCell>
                            <TableCell className="text-slate-800 font-semibold text-right">
                              {formatAmount(
                                selectedInvoice.amount,
                                selectedInvoice.currency
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    {/* Notes */}
                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">
                        Notes
                      </h4>
                      <p className="text-sm text-slate-600">
                        {selectedInvoice.notes}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="border-slate-300 text-slate-800 rounded-lg"
                      onClick={() => setIsInvoiceModalOpen(false)}
                    >
                      Fermer
                    </Button>
                    <Button
                      className="bg-[#0771CB] hover:bg-[#055a9e] text-white rounded-lg"
                      onClick={() =>
                        alert(
                          `Téléchargement PDF de la facture ${selectedInvoice.invoice_id} non implémenté`
                        )
                      }
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Elements>
  );
}
