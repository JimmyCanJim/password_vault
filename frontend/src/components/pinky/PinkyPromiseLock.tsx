import { motion, AnimatePresence } from "framer-motion";
import { HeartHandshake, Sparkles } from "lucide-react";

export function PinkyPromiseLock({ show, onDone }: { show: boolean; onDone?: () => void }) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative flex flex-col items-center gap-6">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary opacity-20 blur-2xl"
                animate={{ scale: [0.6, 1.3, 1], opacity: [0, 0.5, 0.25] }}
                transition={{ duration: 1.4 }}
              />
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 12 }}
                className="flex h-28 w-28 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-xl"
              >
                <HeartHandshake className="h-14 w-14" />
              </motion.div>
              <motion.div
                className="absolute -right-2 -top-2"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.4, 1], rotate: 360 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Sparkles className="h-9 w-9 text-primary" />
              </motion.div>
            </div>
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-2xl font-bold text-primary">Pact Sealed</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your pinky promise is locked on-chain</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

