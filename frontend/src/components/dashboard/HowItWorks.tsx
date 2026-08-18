const steps = [
  {
    step: 'Step 1',
    title: 'Upload Report',
    description: 'Drag and drop your PDF lab results, scan photo, or DOCX medical file into your secure workspace.',
    icon: '📄',
  },
  {
    step: 'Step 2',
    title: 'AI Extracts Medical Information',
    description: 'High-precision vision OCR scans values, reference ranges, clinical notes, and lab tables.',
    icon: '🔍',
  },
  {
    step: 'Step 3',
    title: 'Medical Terms Simplified',
    description: 'Dense medical terminology is translated into clear, empathetic, plain-language summaries.',
    icon: '💡',
  },
  {
    step: 'Step 4',
    title: 'Chat With Report',
    description: 'Ask questions, clarify diagnoses, check dosage guidance, and understand abnormal flags with AI.',
    icon: '💬',
  },
  {
    step: 'Step 5',
    title: 'Download Simplified Report',
    description: 'Export an easy-to-read PDF summary to keep for your records or share with your doctor.',
    icon: '📥',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[#FAFAF8] relative overflow-hidden" aria-label="How It Works">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-body text-xs uppercase tracking-[0.2em] font-semibold text-[#1D9E75] mb-3">
            5 Simple Steps
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18322D] tracking-tight">
            How MedSimplify AI Works
          </h2>
          <p className="mt-4 font-body text-base text-[#4A5E59]">
            From dense medical report to clear understanding in under 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-[24px] border border-[#E3F1EB] bg-white p-6 shadow-[0_10px_30px_rgba(24,50,45,0.04)] flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#1D9E75]/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E1F5EE] text-2xl mb-4">
                {item.icon}
              </div>
              <span className="font-body text-[11px] font-bold uppercase tracking-wider text-[#1D9E75] mb-1">
                {item.step}
              </span>
              <h3 className="font-display text-base font-semibold text-[#18322D] mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="font-body text-xs text-[#4A5E59] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
