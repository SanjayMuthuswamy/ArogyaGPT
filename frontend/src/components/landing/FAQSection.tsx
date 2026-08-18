import { useState } from 'react'

const faqs = [
  {
    q: 'How does MedSimplify AI process my medical reports?',
    a: 'Our vision AI system extracts text from uploaded PDF or image lab reports, normalizes clinical terminology, and matches findings against standard medical references to generate plain-language explanations.',
  },
  {
    q: 'Is my health data secure and private?',
    a: 'Yes. MedSimplify AI uses bank-grade 256-bit SSL encryption. We do not sell or share personal health data, and your uploaded files remain fully encrypted and under your control.',
  },
  {
    q: 'What file formats are supported?',
    a: 'You can upload PDF documents, scanned images (JPG, PNG, WEBP), or Microsoft Word files (DOCX). You can also capture reports directly using your smartphone camera.',
  },
  {
    q: 'Can MedSimplify AI replace my doctor’s diagnosis?',
    a: 'No. MedSimplify AI is designed purely for educational guidance and report comprehension. It translates complex medical terms into understandable concepts but does not diagnose or prescribe treatment. Always consult a qualified healthcare professional.',
  },
  {
    q: 'Can I chat with the AI about specific lab values?',
    a: 'Absolutely! Our AI Chat allows you to ask targeted questions about any test parameter, normal ranges, prescribed medication purposes, or dietary suggestions based on your report.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-20 bg-white relative overflow-hidden" aria-label="Frequently Asked Questions">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <p className="font-body text-xs uppercase tracking-[0.2em] font-semibold text-[#1D9E75] mb-3">
            Answers & Clarity
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18322D] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 font-body text-base text-[#4A5E59]">
            Everything you need to know about MedSimplify AI report analysis and privacy.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="rounded-[20px] border border-[#E3F1EB] bg-[#FAFAF8] transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-display text-base font-semibold text-[#18322D] hover:text-[#1D9E75] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E1F5EE] text-[#1D9E75]">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 font-body text-sm text-[#4A5E59] leading-relaxed border-t border-[#EEF5F2] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
