import React, { useEffect, useState } from 'react';
import { FileCheck2, ExternalLink, CheckCircle2, XCircle, FileText, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export default function PrescriptionVerification() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { success, error, info } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      // Load all pending prescription verification orders
      const data = await orderService.getOrders({ status: 'PENDING_PRESCRIPTION_VERIFICATION' });
      // If none found with status filter, also check for any pending prescription_status
      if (!data || data.length === 0) {
        const allOrders = await orderService.getOrders();
        const pending = allOrders.filter(
          (o) => o.prescription_status === 'PENDING' || o.order_status === 'PENDING_PRESCRIPTION_VERIFICATION'
        );
        setOrders(pending || []);
      } else {
        setOrders(data || []);
      }
    } catch {
      error('Unable to load prescriptions awaiting review.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id, decision) => {
    setProcessingId(id);
    try {
      await orderService.verifyPrescription(id, decision);
      if (decision === 'APPROVE') {
        success('Prescription approved! Patient can now proceed to payment on their order tracking page.');
      } else {
        info('Prescription rejected. Order marked as rejected.');
      }
      load();
    } catch (err) {
      error(err.response?.data?.error || 'Unable to save prescription decision.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Prescription Verification
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review uploaded clinical prescriptions. Once approved, the patient receives instant notification to complete payment and unlock dispatch.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            All Prescriptions Verified
          </h3>
          <p className="text-xs text-slate-400">
            No patient orders are currently awaiting prescription review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const hasFile = !!(order.prescription_url || order.prescription_file);
            const isProcessing = processingId === order.id;

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-300/40 dark:border-amber-700/40 shadow-soft space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                        #{order.order_number}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Awaiting Verification</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Patient: <span className="font-semibold text-slate-700 dark:text-slate-300">{order.shipping_name}</span> · {order.user_info?.email || order.shipping_phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">Order Value</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Prescribed Medicines in Order:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {order.items?.map((i) => (
                      <span key={i.id} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {i.quantity}x {i.medicine_name} ({i.dosage_form || 'Tablet'} - {i.strength})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {hasFile ? (
                      <a
                        href={order.prescription_url || order.prescription_file}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                      >
                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        <span>View Uploaded Prescription</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Prescription details attached with clinical order</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => decide(order.id, 'APPROVE')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isProcessing ? 'Approving...' : 'Approve Prescription'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => decide(order.id, 'REJECT')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition active:scale-95"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
