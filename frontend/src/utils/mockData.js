export const MOCK_JOBS = [
    {
        _id: '1', title: 'Farm Supervisor', category: 'Agriculture',
        type: 'FULL_TIME', status: 'OPEN', district: 'Jaffna',
        salary: { min: 35000, max: 55000 },
        description: 'Looking for experienced farm supervisor to manage daily operations at Green Valley Farms. The ideal candidate will have 3+ years of experience in crop management and team leadership. You will be responsible for overseeing the harvesting cycle, managing farm workers, and ensuring quality control standards are met across all yields.\n\nAccommodation provided on-site for non-local candidates.',
        companyId: { name: 'Green Valley Farms', logoUrl: null, description: 'Leading organic produce exporter in the Northern province.', website: 'www.greenvalley.lk' },
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        applicationsCount: 14
    },
    {
        _id: '2', title: 'Construction Worker (Mason)', category: 'Construction',
        type: 'CONTRACT', status: 'OPEN', district: 'Galle',
        salary: { min: 40000, max: 75000 },
        description: 'Immediate requirement for skilled masons for a commercial building project in Galle town. Min 2 years experience required. Meals provided during shift.',
        companyId: { name: 'BuildRight Construction', logoUrl: null, description: 'Commercial construction specialists.' },
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        applicationsCount: 8
    },
    {
        _id: '3', title: 'Ward Nurse', category: 'Healthcare',
        type: 'FULL_TIME', status: 'OPEN', district: 'Kandy',
        salary: { min: 60000, max: 80000 },
        description: 'Registered nurse required for night shift duties at MedCare Hospital. Must have valid SLMC registration.',
        companyId: { name: 'MedCare Hospital', logoUrl: null },
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        applicationsCount: 22
    },
    {
        _id: '4', title: 'Primary Teacher', category: 'Education',
        type: 'FULL_TIME', status: 'OPEN', district: 'Anuradhapura',
        salary: { min: 45000, max: 55000 },
        description: 'Seeking passionate English and Mathematics teacher for Grade 1-5 students. Diploma in Education preferred.',
        companyId: { name: 'Sunbeam Academy', logoUrl: null },
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        applicationsCount: 31
    },
    {
        _id: '5', title: 'Delivery Rider', category: 'Transport',
        type: 'PART_TIME', status: 'OPEN', district: 'Kurunegala',
        salary: { min: 30000, max: 50000 },
        description: 'Part-time delivery riders needed for local food and grocery deliveries. Must own a valid driving license and motorcycle.',
        companyId: { name: 'QuickDrop Logistics', logoUrl: null },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        applicationsCount: 5
    },
    {
        _id: '6', title: 'Tuk-tuk Driver', category: 'Logistics',
        type: 'FULL_TIME', status: 'OPEN', district: 'Colombo',
        salary: { min: 40000, max: 60000 },
        description: 'Friendly Tuk-tuk drivers needed for our new courier service in the Colombo district.',
        companyId: { name: 'CityExpress Logistics', logoUrl: null },
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        applicationsCount: 12
    },
    {
        _id: '7', title: 'Pettah Shop Assistant', category: 'Retail',
        type: 'FULL_TIME', status: 'OPEN', district: 'Colombo',
        salary: { min: 35000, max: 50000 },
        description: 'Helper needed for a busy wholesale shop in Pettah. Must be physically fit.',
        companyId: { name: 'Pettah Wholesale Center', logoUrl: null },
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        applicationsCount: 7
    },
    {
        _id: '8', title: 'Garment QC Specialist', category: 'Garment',
        type: 'FULL_TIME', status: 'OPEN', district: 'Gampaha',
        salary: { min: 45000, max: 65000 },
        description: 'Quality Control specialist for apparel exports. Experience in Juki machines preferred.',
        companyId: { name: 'BlueLines Apparel', logoUrl: null },
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        applicationsCount: 19
    }
];

export const MOCK_APPLICATIONS = [
    { _id: 'a1', job: MOCK_JOBS[0], status: 'APPLIED', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { _id: 'a2', job: MOCK_JOBS[2], status: 'SHORTLISTED', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
    { _id: 'a3', job: MOCK_JOBS[3], status: 'REJECTED', createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
]
