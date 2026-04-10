import { motion } from "framer-motion";

interface Props {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

const SectionHeading = ({ title, subtitle, centered = true }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`mb-10 ${centered ? "text-center" : ""}`}
  >
    <h2 className="text-3xl md:text-4xl font-heading text-foreground">{title}</h2>
    {subtitle && <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
    <div className={`mt-4 h-1 w-16 rounded-full bg-primary ${centered ? "mx-auto" : ""}`} />
  </motion.div>
);

export default SectionHeading;
