// Hidden PDF export component — always light theme, never dark
// Positioned off-screen, captured by html2pdf.js

interface PdfParam {
  name: string
  value: string
  unit: string
  range: string
  status: 'normal' | 'warning' | 'critical'
  plain: string
  translation: string
}

interface PdfSection {
  name: string
  params: PdfParam[]
}

interface PdfExportContentProps {
  patientName: string
  reportDate: string
  language: string
  sections: PdfSection[]
  summary: string
  insights: { icon: string; title: string; body: string }[]
}

const STATUS_COLORS = {
  normal:   { text: '#3A9E6E', bg: 'transparent',                     badge: '#EBF7F1', badgeText: '#2D7A56' },
  warning:  { text: '#D4924A', bg: 'transparent',                     badge: '#FEF3E8', badgeText: '#A96E2E' },
  critical: { text: '#C0574A', bg: 'rgba(192,87,74,0.05)',            badge: '#FDECEA', badgeText: '#A03020' },
}

export default function PdfExportContent({
  patientName,
  reportDate,
  language,
  sections,
  summary,
  insights,
}: PdfExportContentProps) {
  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      id="pdf-export-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        visibility: 'hidden',
        width: '800px',
        background: '#FDFCFA',
        color: '#1A2420',
        fontFamily: "'Inter', 'DM Sans', Arial, sans-serif",
        fontSize: '13px',
        lineHeight: '1.6',
      }}
    >
      {/* ── PDF HEADER ── */}
      <div style={{
        background: '#1C2B2D',
        padding: '32px 40px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        color: '#F5F2EE',
      }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '22px', fontWeight: 500, color: '#F5F2EE', marginBottom: '4px' }}>
            MedEase AI
          </div>
          <div style={{ fontSize: '13px', color: '#8FA49E', letterSpacing: '0.04em' }}>
            Simplified Medical Report
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '16px', fontWeight: 500, color: '#F5F2EE', marginBottom: '4px' }}>
            {patientName}
          </div>
          <div style={{ fontSize: '13px', color: '#8FA49E', marginBottom: '8px' }}>
            {reportDate}
          </div>
          <span style={{
            display: 'inline-block',
            fontSize: '11px',
            padding: '2px 10px',
            borderRadius: '99px',
            background: 'rgba(120,211,188,0.15)',
            color: '#78D3BC',
            border: '1px solid rgba(120,211,188,0.25)',
          }}>
            {language}
          </span>
        </div>
      </div>

      {/* ── SUMMARY BOX ── */}
      <div style={{ padding: '0 40px', marginTop: '24px' }}>
        <div style={{
          background: '#EEF5F2',
          border: '1px solid rgba(46,125,107,0.15)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8FA49E', marginBottom: '10px' }}>
            Report Summary
          </div>
          <p style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '16px',
            fontStyle: 'italic',
            color: '#1A2420',
            margin: 0,
            lineHeight: '1.7',
          }}>
            "{summary}"
          </p>
        </div>
      </div>

      {/* ── PARAMETER SECTIONS ── */}
      <div style={{ padding: '24px 40px 0' }}>
        {sections.map(section => (
          <div key={section.name} className="pdf-section" style={{ marginBottom: '28px' }}>
            {/* Section heading */}
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1A2420',
              borderBottom: '1px solid rgba(46,125,107,0.12)',
              paddingBottom: '8px',
              marginBottom: '12px',
            }}>
              {section.name}
            </div>

            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 100px',
              gap: '8px',
              padding: '6px 0',
              borderBottom: '0.5px solid #E8E4DF',
              marginBottom: '2px',
            }}>
              {['Parameter', 'Your Value', 'Status'].map(h => (
                <span key={h} style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8FA49E' }}>{h}</span>
              ))}
            </div>

            {/* Parameter rows */}
            {section.params.map(param => {
              const colors = STATUS_COLORS[param.status]
              return (
                <div
                  key={param.name}
                  style={{
                    background: colors.bg,
                    borderLeft: param.status === 'critical' ? '3px solid #C0574A' : '3px solid transparent',
                    borderBottomLeftRadius: 0,
                    borderTopLeftRadius: 0,
                    padding: '10px 0 10px 8px',
                    borderBottom: '0.5px solid #E8E4DF',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px', gap: '8px', alignItems: 'start' }}>
                    {/* Name */}
                    <div>
                      <div style={{ fontSize: '13px', color: '#1A2420', fontWeight: 500 }}>{param.name}</div>
                      <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#4A5E59', marginTop: '3px' }}>{param.plain}</div>
                      <div style={{ fontSize: '12px', color: '#2E7D6B', marginTop: '2px' }}>{param.translation}</div>
                    </div>
                    {/* Value */}
                    <div style={{ fontFamily: "'JetBrains Mono', Menlo, monospace", fontSize: '13px', fontWeight: 600, color: colors.text }}>
                      {param.value} {param.unit}
                      <div style={{ fontFamily: 'inherit', fontSize: '11px', color: '#8FA49E', fontWeight: 400 }}>Normal: {param.range}</div>
                    </div>
                    {/* Badge */}
                    <div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        padding: '2px 10px',
                        borderRadius: '99px',
                        background: colors.badge,
                        color: colors.badgeText,
                        fontWeight: 500,
                      }}>
                        {param.status === 'normal' ? '✓ Normal' : param.status === 'warning' ? '~ Borderline' : '! High'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── HEALTH INSIGHTS ── (only if there are abnormal values) */}
      {insights.length > 0 && (
        <div style={{ padding: '8px 40px 24px' }} className="pdf-section">
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '16px',
            color: '#1A2420',
            marginBottom: '16px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(46,125,107,0.12)',
          }}>
            Health Insights &amp; Recommendations
          </div>
          {insights.map(insight => (
            <div key={insight.title} style={{
              background: '#F5F2EE',
              border: '1px solid rgba(46,125,107,0.12)',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '12px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A2420', marginBottom: '8px' }}>
                {insight.icon} {insight.title}
              </div>
              <div style={{ fontSize: '13px', color: '#4A5E59', lineHeight: '1.65' }}>
                {insight.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PDF FOOTER ── */}
      <div style={{
        borderTop: '1px solid rgba(46,125,107,0.15)',
        padding: '16px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        alignItems: 'center',
        gap: '12px',
        marginTop: '8px',
      }}>
        <div style={{ fontSize: '11px', color: '#8FA49E' }}>Generated by MedEase AI</div>
        <div style={{ fontSize: '11px', color: '#8FA49E', fontStyle: 'italic', textAlign: 'center', lineHeight: '1.5' }}>
          This report is for informational purposes only.<br />
          Consult your doctor for medical advice.
        </div>
        <div style={{ fontSize: '11px', color: '#8FA49E', textAlign: 'right' }}>{generatedAt}</div>
      </div>
    </div>
  )
}
