import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function Cancel() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 bg-[#0a0a0a] text-white">
      <div className="mx-auto w-[92%] max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 text-center"
        >
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-white/5 border border-white/15">
            <XCircle size={32} className="text-white/70" />
          </div>
          <h1 className="text-3xl font-bold font-orbitron mb-3">Checkout canceled</h1>
          <p className="text-white/60 max-w-md mx-auto mb-8">
            No charge was made. Your cart is still saved — pick up where you left off whenever you're ready.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF7A00] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-black"
            >
              <ArrowLeft size={16} /> Return to checkout
            </Link>
            <Link
              to="/shop"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white/80 hover:text-white"
            >
              Keep shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
