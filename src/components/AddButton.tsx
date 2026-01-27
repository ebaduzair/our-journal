import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface AddButtonProps {
  onClick: () => void;
  label?: string;
}

export function AddButton({ onClick, label }: AddButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full gradient-romantic shadow-glow flex items-center justify-center group"
    >
      <Plus className="w-6 h-6 text-primary-foreground" />
      {label && (
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-full bg-card shadow-card text-sm font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {label}
        </span>
      )}
    </motion.button>
  );
}
