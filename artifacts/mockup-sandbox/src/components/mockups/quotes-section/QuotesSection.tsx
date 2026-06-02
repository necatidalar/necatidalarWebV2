import { motion } from "framer-motion";

const quotes = [
  {
    id: 1,
    text: "Herhangi bir aptal kod yazabilir; bunu bir insan anlayabilecek şekilde yazmak ise yetenek gerektirir.",
    author: "Martin Fowler",
    title: "Yazılım Mühendisi & Yazar",
  },
  {
    id: 2,
    text: "Basitlik, güvenilirliğin ön koşuludur.",
    author: "Edsger W. Dijkstra",
    title: "Bilgisayar Bilimcisi",
  },
  {
    id: 3,
    text: "Önce çalışmasını sağla, ardından doğru yap, sonra hızlı yap.",
    author: "Kent Beck",
    title: "Yazılım Mühendisi",
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

export function QuotesSection() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center py-24 px-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <span className="font-mono text-[#6366f1] text-sm tracking-widest uppercase">
            İlham
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            İlham Veren Alıntılar
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid md:grid-cols-3 gap-6"
        >
          {quotes.map((quote) => (
            <motion.div
              key={quote.id}
              variants={fadeIn}
              className="bg-[#12121a] border border-white/5 rounded-2xl p-8 flex flex-col relative overflow-hidden group hover:border-[#6366f1]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.06)]"
            >
              {/* Big quote mark */}
              <div className="text-8xl font-serif text-[#6366f1]/10 leading-none select-none absolute top-3 left-5 group-hover:text-[#6366f1]/20 transition-colors duration-300 font-['Georgia']">
                &ldquo;
              </div>

              {/* Quote text */}
              <p className="text-[#a1a1aa] leading-relaxed text-sm md:text-[15px] relative z-10 flex-1 mt-8">
                {quote.text}
              </p>

              {/* Author */}
              <div className="mt-6 pt-5 border-t border-white/5">
                <p className="text-white font-semibold text-sm">
                  {quote.author}
                </p>
                {quote.title && (
                  <p className="text-[#6366f1]/70 text-xs mt-0.5 font-mono">
                    {quote.title}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
