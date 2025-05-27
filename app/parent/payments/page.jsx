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
  Download,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import apiCall from "@/components/utils/apiCall";
import { useSelector } from "react-redux";
import clsx from "clsx";

const stripePromise = loadStripe(
  "pk_test_51P2fsNCTNOiewRNODTiUb0TDBIGC1NaXNg2Go8IU72GTtnk63efHLef8gAm0eveEaHOlIUaElwYClMtBCkPTuQ0000u0knkOh8"
);

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
  const [historiqueTransaction, setHistoriqueTransaction] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const paymentsPerPage = 2;
  const authToken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchFees = async () => {
      setIsLoading(true);
      try {
        const response = await apiCall(
          "get",
          `/api/fees/?parent_id=${user?.parent_id || 1}&page=${currentPage}&per_page=${paymentsPerPage}`,
          null,
          { token: authToken }
        );

        setHistoriqueTransaction(response.fees);
        setTotalPages(response.pages);
        setHasNext(response.has_next);
        setHasPrev(response.has_prev);

        const totalPaidtmp = response.fees
          .filter((fee) => fee.status === "paid")
          .reduce((sum, fee) => sum + fee.amount * 100, 0);
        const totalUnpaidtmp = response.fees
          .filter((fee) => fee.status === "unpaid")
          .reduce((sum, fee) => sum + fee.amount * 100, 0);
        const totalOverduetmp = response.fees
          .filter((fee) => fee.status === "overdue")
          .reduce((sum, fee) => sum + fee.amount * 100, 0);

        setTotalPaid(totalPaidtmp);
        setTotalUnpaid(totalUnpaidtmp);
        setTotalOverdue(totalOverduetmp);
      } catch (error) {
        console.error("Error fetching fees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (authToken) {
      fetchFees();
    }
  }, [authToken, currentPage, user]);

  // Hardcoded students (replace with API call if available)
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

  // Map API fees to payments
  const initialPayments = historiqueTransaction.map((transaction) => ({
    id: `pi_${transaction.id}`,
    amount: Math.round(transaction.amount * 100), // Convert to cents
    currency: "DZD",
    status: transaction.status === "paid" ? "succeeded" : transaction.status === "overdue" ? "failed" : transaction.status,
    created: transaction.due_date || transaction.created_at,
    payment_method: transaction.payment_date
      ? {
          type: "card",
          brand: "visa",
          last4: "1234",
        }
      : null,
    description: transaction.description,
    student_ids: [], // API does not provide student_ids
    invoice_id: `in_${transaction.id}`,
    frequency: "annual",
    tax_rate: 0,
    notes: transaction.notes || "",
  }));

  const [payments, setPayments] = useState(initialPayments);

  useEffect(() => {
    setPayments(initialPayments);
  }, [historiqueTransaction]);

  // Filter and sort payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === "dateshea") {
      return (sortOrder === "desc" )? new Date(b.created) - new Date(a.created) : new Date(a.created) - new Date(b.created);
    }
    if (sortBy === "amount") {
      return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
    }
    return 0;
  });

  const paginatedPayments = sortedPayments;

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

  // Handle payment by redirecting to Stripe Checkout
  const handlePayment = async () => {
    if (totalOverdue <= 0) {
      alert("Aucun montant en retard à payer.");
      return;
    }

    try {
      function getUnpaidFeeId(historiqueTransactio) {
  const unpaidFee = historiqueTransactio.find(fee => fee.status === "unpaid");
  return unpaidFee ? unpaidFee.id : null;
}  
const feeID=getUnpaidFeeId(historiqueTransaction)
      const stripe = await stripePromise;
      const response = await apiCall(
        "post",
        "/api/payment/create-checkout-session",
        {
         fee_id: feeID,
        },
        { token: authToken }
      );

      const { sessionId } = response;
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Erreur lors de la création de la session de paiement.");
    }
  };

  // Handle view invoice
  const handleViewInvoice = (payment) => {
    setSelectedInvoice(payment);
    setIsInvoiceModalOpen(true);
  };

  if (!authToken) {
    return <div className="p-6 text-center text-slate-800">Chargement...</div>;
  }

  if (isLoading) {
    return <div className="p-6 text-center text-slate-800">Chargement des données...</div>;
  }

  return (
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
              disabled={totalOverdue <= 0}
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
          transition={{ duration: 0.5, delay: 0.2 }}
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
                  <p className="text-sm text-slate-600">Total en retard</p>
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
              placeholder="Rechercher par ID ou description..."
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
                <SelectItem value="unpaid">En attente</SelectItem>
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
                                : payment.status === "unpaid"
                                ? "En attente"
                                : "Inconnu"}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-800">
                            {payment.payment_method
                              ? `${payment.payment_method.brand.toUpperCase()} ****${payment.payment_method.last4}`
                              : "Non payé"}
                          </TableCell>
                          <TableCell className="text-slate-800">
                            {payment.student_ids.length > 0
                              ? payment.student_ids
                                  .map((id) => {
                                    const student = students.find(
                                      (s) => s.id === id
                                    );
                                    return student
                                      ? `${student.first_name} ${student.last_name}`
                                      : "";
                                  })
                                  .join(", ")
                              : "N/A"}
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
                    disabled={!hasPrev}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-300 rounded-lg"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={!hasNext}
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
              <DialogContent className="bg-white rounded-lg shadow-xl max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#0771CB]" />
                    Nouveau paiement
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">
                      Montant en retard (DZD)
                    </label>
                    <Input
                      type="text"
                      className="w-full border-slate-300 rounded-lg shadow-sm"
                      value={formatAmount(totalUnpaid, "DZD")}
                      readOnly
                    />
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
                    disabled={totalOverdue <= 0}
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
                            : selectedInvoice.status === "unpaid"
                            ? "En attente"
                            : "Inconnu"}
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
                          {selectedInvoice.payment_method
                            ? `${selectedInvoice.payment_method.brand.toUpperCase()} ****${selectedInvoice.payment_method.last4}`
                            : "Non payé"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Élèves</p>
                        <p className="text-slate-800">
                          {selectedInvoice.student_ids.length > 0
                            ? selectedInvoice.student_ids
                                .map((id) => {
                                  const student = students.find(
                                    (s) => s.id === id
                                  );
                                  return student
                                    ? `${student.first_name} ${student.last_name}`
                                    : "";
                                })
                                .join(", ")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
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
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">
                      Notes
                    </h4>
                    <p className="text-sm text-slate-600">
                      {selectedInvoice.notes || "Aucune note"}
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
  );
}