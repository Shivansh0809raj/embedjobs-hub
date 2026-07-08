export const T = {
  bg:          '#0D1117',
  surface:     '#161B22',
  surfaceHigh: '#1F2937',
  border:      '#30363D',
  accent:      '#00D4AA',
  warn:        '#F59E0B',
  danger:      '#EF4444',
  success:     '#10B981',
  text:        '#E6EDF3',
  textMuted:   '#8B949E',
  textFaint:   '#484F58',
}

export const STATUS_OPTIONS = ['Saved','Applied','OA Sent','Interview','Offer','Rejected']
export const STATUS_COLORS  = {
  Saved:     '#8B949E',
  Applied:   '#3B82F6',
  'OA Sent': '#8B5CF6',
  Interview: '#F59E0B',
  Offer:     '#10B981',
  Rejected:  '#EF4444',
}

export const ROLES = [
  'Embedded Software Engineer',
  'Firmware Engineer',
  'Embedded Hardware Engineer',
  'IoT Engineer',
  'Memory Engineer',
  'Automotive Embedded Engineer',
  'RTOS Developer',
  'BSP Engineer',
]

export const SITES = [
  { name:'LinkedIn',  url:'https://www.linkedin.com/jobs/search/?keywords=', color:'#0A66C2' },
  { name:'Naukri',    url:'https://www.naukri.com/jobs-in-india?k=',         color:'#FF7555' },
  { name:'Indeed',    url:'https://in.indeed.com/jobs?q=',                   color:'#003A9B' },
  { name:'Wellfound', url:'https://wellfound.com/role/embedded-software-engineer',   color:'#FB923C', noQuery:true },
  { name:'Glassdoor', url:'https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=', color:'#0CAA41' },
]

export const COMPANY_CAREERS = [
  // ── Semiconductor / Chip ─────────────────────────────────────────────────
  { name:'Texas Instruments',       url:'https://careers.ti.com/en/sites/CX/jobs?keyword=', supportsQuery: true },
  { name:'STMicroelectronics',      url:'https://stmicroelectronics.eightfold.ai/careers?query=' },
  { name:'Qualcomm',                url:'https://careers.qualcomm.com/careers?query=' },
  { name:'NXP Semiconductors',      url:'https://nxp.wd3.myworkdayjobs.com/careers?q=' },
  { name:'Renesas',                 url:'https://jobs.renesas.com/jobs?search=' },
  { name:'Infineon',                url:'https://jobs.infineon.com/careers?query=' },
  { name:'Microchip Technology',    url:'https://microchiphr.wd5.myworkdayjobs.com/en-US/External?q=' },
  { name:'NVIDIA',                  url:'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?q=' },
  { name:'Intel',                   url:'https://jobs.intel.com/en/search-jobs?keyword=' },
  { name:'Samsung Semiconductor',   url:'https://semiconductor.samsung.com/about-us/careers/jobs/?search=' },
  { name:'MediaTek',                url:'https://careers.mediatek.com/eREC/JobSearch/Search?searchKey=', supportsQuery: true },
  { name:'Marvell Technology',      url:'https://marvell.wd1.myworkdayjobs.com/MarvellCareers?q=' },
  // ── Automotive / ADAS ────────────────────────────────────────────────────
  { name:'Bosch',                   url:'https://jobs.bosch.com/en/?search=' },
  { name:'Continental AG',          url:'https://jobs.continental.com/en/?search=' },
  { name:'Aptiv',                   url:'https://aptiv.wd1.myworkdayjobs.com/Aptiv?q=' },
  { name:'Harman (Samsung)',        url:'https://harman.wd1.myworkdayjobs.com/Harman_Careers?q=' },
  // ── India Engineering Services ───────────────────────────────────────────
  { name:'Tata Elxsi',              url:'https://www.tataelxsi.com/careers/job-openings?search=' },
  { name:'L&T Technology Services', url:'https://ltts.com/careers/job-search?keyword=' },
  { name:'Wipro',                   url:'https://careers.wipro.com/careers-home/jobs?keyword=' },
  { name:'HCLTech',                 url:'https://careers.hcltech.com/go/All-Jobs/9552355/?q=' },
  { name:'Capgemini Engineering',   url:'https://www.capgemini.com/in-en/careers/join-capgemini/job-search/?search=' },
  { name:'Tata Motors',             url:'https://careers.tatamotors.com/search/?q=' },
]
