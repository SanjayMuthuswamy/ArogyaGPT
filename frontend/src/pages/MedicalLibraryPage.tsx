import { useState } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface MedicalLibraryPageProps {
  onNavigate: (page: string) => void
}

interface Term {
  id: string
  name: string
  category: 'Blood Tests' | 'Diseases' | 'Medicines' | 'Symptoms' | 'Body Parts' | 'Lab Parameters'
  simpleMeaning: string
  example: string
  normalRange?: string
  definition: string
  causes: string
  symptoms: string
  diagnosis: string
  treatment: string
  lifestyle: string
  relatedTerms: string[]
  bookmarked?: boolean
}

const termsData: Term[] = [
  {
    id: '1',
    name: 'HbA1c (Glycated Hemoglobin)',
    category: 'Lab Parameters',
    simpleMeaning: 'Measures your average blood sugar over the last 2 to 3 months.',
    example: 'A value of 5.8% indicates prediabetes range.',
    normalRange: 'Below 5.7% (Normal)',
    definition: 'HbA1c is a lab parameter indicating the percentage of hemoglobin coated with sugar.',
    causes: 'High intake of refined carbs, sedentary lifestyle, genetic insulin resistance.',
    symptoms: 'Increased thirst, frequent urination, fatigue, blurry vision.',
    diagnosis: 'Routine venous blood test sampled after 8-hour fasting.',
    treatment: 'Lifestyle modification, dietary carb reduction, Metformin if prescribed by doctor.',
    lifestyle: 'Walk 30 mins daily, increase dietary fiber, reduce sugary beverages.',
    relatedTerms: ['Fasting Glucose', 'Postprandial Blood Sugar', 'Insulin Sensitivity'],
  },
  {
    id: '2',
    name: 'Total Hemoglobin',
    category: 'Blood Tests',
    simpleMeaning: 'Protein in red blood cells that carries oxygen to your body tissues.',
    example: 'A reading of 14.2 g/dL indicates optimal oxygen distribution.',
    normalRange: '13.5 - 17.5 g/dL (Males) / 12.0 - 15.5 g/dL (Females)',
    definition: 'Hemoglobin is an iron-rich protein binding oxygen molecules in circulation.',
    causes: 'Low levels caused by iron deficiency, blood loss, or Vitamin B12 deficiency.',
    symptoms: 'Shortness of breath, pale skin, cold hands, dizziness.',
    diagnosis: 'Complete Blood Count (CBC) automated analyzer.',
    treatment: 'Iron supplementation, B12 injections, high-protein diet.',
    lifestyle: 'Eat spinach, lentils, pomegranate, and red meat.',
    relatedTerms: ['Hematocrit', 'RBC Count', 'Ferritin'],
  },
  {
    id: '3',
    name: 'Hypertension (High Blood Pressure)',
    category: 'Diseases',
    simpleMeaning: 'Condition where the force of blood against artery walls is consistently too high.',
    example: 'Blood pressure reading above 130/80 mmHg.',
    normalRange: 'Below 120/80 mmHg',
    definition: 'Chronic elevation of systemic arterial blood pressure.',
    causes: 'Excess salt intake, stress, obesity, lack of exercise, genetics.',
    symptoms: 'Often silent; severe cases cause morning headaches or chest tightness.',
    diagnosis: 'Sphygmomanometer arm cuff monitoring.',
    treatment: 'Antihypertensive medication (ACE inhibitors, Beta-blockers).',
    lifestyle: 'DASH diet, salt under 5g daily, regular aerobic exercise.',
    relatedTerms: ['Systolic Pressure', 'Diastolic Pressure', 'Cholesterol'],
  },
  {
    id: '4',
    name: 'Metformin',
    category: 'Medicines',
    simpleMeaning: 'First-line medication used to lower blood sugar in Type 2 Diabetes.',
    example: 'Commonly prescribed as 500mg twice daily with meals.',
    normalRange: 'Prescription Controlled',
    definition: 'Biguanide class oral antihyperglycemic agent that reduces hepatic glucose production.',
    causes: 'Prescribed for elevated blood glucose and insulin resistance.',
    symptoms: 'Mild stomach upset, nausea during initial week of use.',
    diagnosis: 'Prescribed following HbA1c elevation > 6.5%.',
    treatment: 'Oral tablet taken with food to minimize GI effects.',
    lifestyle: 'Pair with low-glycemic index dietary regimen.',
    relatedTerms: ['HbA1c', 'Type 2 Diabetes', 'Insulin'],
  },
  {
    id: '5',
    name: 'Fatigue & Lethargy',
    category: 'Symptoms',
    simpleMeaning: 'Feeling constantly tired, weak, or lacking physical energy.',
    example: 'Commonly associated with low thyroid TSH or anemia.',
    normalRange: 'Subjective Assessment',
    definition: 'Symptom characterized by persistent tiredness not relieved by sleep.',
    causes: 'Anemia, hypothyroidism, sleep apnea, chronic stress.',
    symptoms: 'Brain fog, low physical stamina, heavy limbs.',
    diagnosis: 'Blood panel checking Thyroid TSH, Ferritin, and Vitamin D.',
    treatment: 'Address root deficiency identified in lab test.',
    lifestyle: 'Maintain 8 hours sleep schedule, hydrate 3L daily.',
    relatedTerms: ['Thyroid TSH', 'Hemoglobin', 'Vitamin D3'],
  },
  {
    id: '6',
    name: 'Pancreas',
    category: 'Body Parts',
    simpleMeaning: 'Gland organ behind the stomach producing insulin and digestive enzymes.',
    example: 'Produces insulin to regulate blood sugar after meals.',
    normalRange: 'Anatomical Organ',
    definition: 'Endocrine and exocrine organ regulating glucose homeostasis.',
    causes: 'Pancreatitis caused by gallstones or high alcohol intake.',
    symptoms: 'Upper abdominal pain radiating to the back, nausea.',
    diagnosis: 'Serum Amylase & Lipase blood tests, CT scan.',
    treatment: 'Enzyme replacement therapy, fasting during acute inflammation.',
    lifestyle: 'Avoid alcohol, limit saturated animal fats.',
    relatedTerms: ['Insulin', 'Amylase', 'Lipase'],
  },
]

const categories = ['All', 'Blood Tests', 'Diseases', 'Medicines', 'Symptoms', 'Body Parts', 'Lab Parameters']

export default function MedicalLibraryPage({ onNavigate }: MedicalLibraryPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [activeModalTerm, setActiveModalTerm] = useState<Term | null>(null)
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({})

  const filteredTerms = termsData.filter((term) => {
    const matchesCat = selectedCategory === 'All' || term.category === selectedCategory
    const matchesSearch =
      term.name.toLowerCase().includes(search.toLowerCase()) ||
      term.simpleMeaning.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <AuthenticatedShell
      title="Medical Library"
      subtitle="Interactive clinical dictionary with 500+ lab terms, diseases, and medications."
      onNavigate={onNavigate}
      currentPage="library"
    >

      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search medical terms (e.g. HbA1c, Hemoglobin, Glucose)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#DCEBE6] bg-white py-3 pl-10 pr-4 font-body text-xs text-[#18322D] focus:border-[#1D9E75] focus:outline-none shadow-sm"
          />
          <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8FA49E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="mb-8 flex flex-wrap gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-2 font-body text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-[#1D9E75] text-white shadow-sm'
                : 'border border-[#DCEBE6] bg-white text-[#4A5E59] hover:bg-[#F7FCF9] hover:text-[#18322D]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Term Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTerms.map((term) => (
          <div
            key={term.id}
            onClick={() => setActiveModalTerm(term)}
            className="group cursor-pointer rounded-[24px] border border-[#E3F1EB] bg-white p-6 shadow-sm hover:border-[#1D9E75]/40 hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#1D9E75]">
                  {term.category}
                </span>
                <button
                  onClick={(e) => toggleBookmark(term.id, e)}
                  className="text-lg hover:scale-110 transition"
                  title="Bookmark Term"
                >
                  {bookmarks[term.id] ? '⭐' : '☆'}
                </button>
              </div>

              <h3 className="font-display text-base font-semibold text-[#18322D] group-hover:text-[#1D9E75] transition">
                {term.name}
              </h3>
              <p className="mt-2 font-body text-xs text-[#4A5E59] leading-relaxed">
                {term.simpleMeaning}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EEF5F2]">
              {term.normalRange && (
                <div className="flex justify-between items-center text-[11px] font-body">
                  <span className="text-[#8FA49E]">Normal Range:</span>
                  <span className="font-mono font-semibold text-[#18322D]">{term.normalRange}</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between font-body text-xs text-[#1D9E75] font-semibold group-hover:translate-x-1 transition">
                <span>View Full Definition & Tips</span>
                <span>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeModalTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-8 shadow-2xl border border-[#E3F1EB] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4 mb-4">
              <div>
                <span className="font-body text-xs font-bold uppercase tracking-wider text-[#1D9E75] bg-[#E1F5EE] px-3 py-1 rounded-full">
                  {activeModalTerm.category}
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold text-[#18322D]">{activeModalTerm.name}</h2>
              </div>
              <button
                onClick={() => setActiveModalTerm(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAFAF8] text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-body text-xs text-[#4A5E59] leading-relaxed">
              <div className="rounded-2xl bg-[#F7FCF9] border border-[#E3F1EB] p-4">
                <h4 className="font-bold text-[#18322D] mb-1">Simple Meaning:</h4>
                <p>{activeModalTerm.simpleMeaning}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#18322D] mb-1">Full Clinical Definition:</h4>
                <p>{activeModalTerm.definition}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#EEF5F2] bg-[#FAFAF8]">
                  <h4 className="font-bold text-[#18322D] mb-1">Potential Causes / Triggers:</h4>
                  <p>{activeModalTerm.causes}</p>
                </div>
                <div className="p-4 rounded-xl border border-[#EEF5F2] bg-[#FAFAF8]">
                  <h4 className="font-bold text-[#18322D] mb-1">Associated Symptoms:</h4>
                  <p>{activeModalTerm.symptoms}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#18322D] mb-1">Treatment & Management Overview:</h4>
                <p>{activeModalTerm.treatment}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#E1F5EE] border border-[#DCEBE6] text-[#18322D]">
                <h4 className="font-bold mb-1">🌱 Lifestyle & Nutrition Tips:</h4>
                <p>{activeModalTerm.lifestyle}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#18322D] mb-2">Related Terms:</h4>
                <div className="flex flex-wrap gap-2">
                  {activeModalTerm.relatedTerms.map((rt, idx) => (
                    <span key={idx} className="rounded-full border border-[#DCEBE6] bg-white px-3 py-1 text-[11px] font-medium text-[#1D9E75]">
                      {rt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <button
                onClick={() => toggleBookmark(activeModalTerm.id)}
                className="font-body text-xs font-semibold text-[#1D9E75] flex items-center gap-1"
              >
                {bookmarks[activeModalTerm.id] ? '⭐ Bookmarked' : '☆ Bookmark Term'}
              </button>
              <button
                onClick={() => setActiveModalTerm(null)}
                className="rounded-full bg-[#18322D] px-6 py-2 font-body text-xs font-semibold text-white shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedShell>
  )
}
