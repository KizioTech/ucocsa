import { MessageCircle } from "lucide-react";

const WhatsAppFAB = () => (
  <a
    href="https://wa.me/265999978828"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-[#fff] px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow animate-pulse-glow"
    aria-label="to us on WhatsApp"
  >
    <MessageCircle size={20} />
    <span className="hidden sm:inline text-sm font-semibold">WhatsApp</span>
  </a>
);

export default WhatsAppFAB;
