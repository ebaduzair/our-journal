import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface HeartAnimationProps {
  size?: number;
  delay?: number;
}

export function HeartAnimation({ size = 24, delay = 0 }: HeartAnimationProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, delay }}
      >
        <Heart className="text-primary fill-primary" style={{ width: size, height: size }} />
      </motion.div>
    </motion.div>
  );
}

export function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-light"
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: '100%',
            opacity: 0.3 
          }}
          animate={{ 
            y: '-20%',
            opacity: 0,
            rotate: Math.random() * 360 
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 2,
            ease: 'linear'
          }}
        >
          <Heart className="w-4 h-4 fill-current" />
        </motion.div>
      ))}
    </div>
  );
}
