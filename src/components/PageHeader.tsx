import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
}

export function PageHeader({ title, subtitle, emoji }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-6 pb-4 px-4"
    >
      <div className="flex items-center gap-2">
        {emoji && <span className="text-2xl">{emoji}</span>}
        <h1 className="font-romantic text-3xl font-semibold text-gradient">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-sm mt-1 ml-9">
          {subtitle}
        </p>
      )}
    </motion.header>
  );
}
