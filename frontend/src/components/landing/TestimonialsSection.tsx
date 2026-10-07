const testimonials = [
  {
    name: 'Dr. Ananya Sharma',
    role: 'Senior Physician & Health Educator',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
    quote: 'MedSimplify AI is a game-changer. It helps my patients come to consultations informed, reducing anxiety and allowing us to discuss treatment paths instead of decoding medical jargon.',
    rating: 5,
  },
  {
    name: 'Ramesh Patel',
    role: 'Patient & Family Caregiver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    quote: 'I uploaded my father’s complex lipid panel and cardiac report. Within seconds, MedSimplify explained what every number meant in plain English without frightening technical jargon.',
    rating: 5,
  },
  {
    name: 'Priya Sundaram',
    role: 'Diabetes Patient',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    quote: 'The AI chat feature is incredible. I asked about my HbA1c values and got actionable daily diet & lifestyle context right away. Highly recommended!',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-[#FAFAF8] relative overflow-hidden" aria-label="Testimonials">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-body text-xs uppercase tracking-[0.2em] font-semibold text-[#1D9E75] mb-3">
            Trusted by Patients & Physicians
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#18322D] tracking-tight">
            Real Stories, Real Clarity
          </h2>
          <p className="mt-4 font-body text-sm sm:text-base text-[#4A5E59]">
            Discover how thousands of users and health professionals rely on MedSimplify AI for health peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <article
              key={idx}
              className="rounded-[24px] border border-[#E3F1EB] bg-white p-7 shadow-[0_12px_36px_rgba(24,50,45,0.04)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4 text-[#E6A817]">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-body text-sm text-[#4A5E59] leading-relaxed italic mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[#EEF5F2]">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#1D9E75]/20"
                />
                <div>
                  <h4 className="font-display text-sm font-semibold text-[#18322D]">{item.name}</h4>
                  <p className="font-body text-xs text-[#8FA49E]">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
