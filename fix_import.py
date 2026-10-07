with open('frontend/src/pages/ReportViewPage.tsx', encoding='utf-8') as f:
    content = f.read()

old = "import ReportPanel, { Section, Parameter } from '../components/report/ReportPanel'"
new = "import ReportPanel, { Section, Parameter, Insight } from '../components/report/ReportPanel'"
content = content.replace(old, new)

with open('frontend/src/pages/ReportViewPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done:', 'Insight' in content)
