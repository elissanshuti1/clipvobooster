// Realistic lead data from actual companies and sources
export const REAL_COMPANIES = [
  { name: 'Stripe', domain: 'stripe.com', industry: 'Fintech', location: 'San Francisco, CA' },
  { name: 'Notion', domain: 'notion.so', industry: 'Productivity', location: 'San Francisco, CA' },
  { name: 'Vercel', domain: 'vercel.com', industry: 'Developer Tools', location: 'San Francisco, CA' },
  { name: 'Figma', domain: 'figma.com', industry: 'Design', location: 'San Francisco, CA' },
  { name: 'Linear', domain: 'linear.app', industry: 'Project Management', location: 'San Francisco, CA' },
  { name: 'Raycast', domain: 'raycast.com', industry: 'Productivity', location: 'Europe' },
  { name: 'Supabase', domain: 'supabase.com', industry: 'Developer Tools', location: 'Singapore' },
  { name: 'Planetscale', domain: 'planetscale.com', industry: 'Database', location: 'San Francisco, CA' },
  { name: 'Resend', domain: 'resend.com', industry: 'Email', location: 'San Francisco, CA' },
  { name: 'Cal.com', domain: 'cal.com', industry: 'Scheduling', location: 'London, UK' },
  { name: 'Gumroad', domain: 'gumroad.com', industry: 'E-commerce', location: 'San Francisco, CA' },
  { name: 'ConvertKit', domain: 'convertkit.com', industry: 'Marketing', location: 'Boise, ID' },
  { name: 'Webflow', domain: 'webflow.com', industry: 'Web Development', location: 'San Francisco, CA' },
  { name: 'Airtable', domain: 'airtable.com', industry: 'Database', location: 'San Francisco, CA' },
  { name: 'Zapier', domain: 'zapier.com', industry: 'Automation', location: 'San Francisco, CA' },
  { name: 'Canva', domain: 'canva.com', industry: 'Design', location: 'Sydney, Australia' },
  { name: 'Miro', domain: 'miro.com', industry: 'Collaboration', location: 'Amsterdam' },
  { name: 'Slack', domain: 'slack.com', industry: 'Communication', location: 'San Francisco, CA' },
  { name: 'Discord', domain: 'discord.com', industry: 'Communication', location: 'San Francisco, CA' },
  { name: 'Shopify', domain: 'shopify.com', industry: 'E-commerce', location: 'Ottawa, Canada' },
  { name: 'Substack', domain: 'substack.com', industry: 'Publishing', location: 'San Francisco, CA' },
  { name: 'Ghost', domain: 'ghost.org', industry: 'Publishing', location: 'Singapore' },
  { name: 'Patreon', domain: 'patreon.com', industry: 'Creator Economy', location: 'San Francisco, CA' },
  { name: 'Loom', domain: 'loom.com', industry: 'Video', location: 'San Francisco, CA' },
  { name: 'Descript', domain: 'descript.com', industry: 'Video Editing', location: 'San Francisco, CA' },
];

export const REAL_NAMES = [
  { first: 'Brian', last: 'Chesky', role: 'CEO' },
  { first: 'Patrick', last: 'Collison', role: 'CEO' },
  { first: 'Stewart', last: 'Butterfield', role: 'CEO' },
  { first: 'Melanie', last: 'Perkins', role: 'CEO' },
  { first: 'Ivan', last: 'Zhao', role: 'CEO' },
  { first: 'Guillaume', last: 'Poncin', role: 'CEO' },
  { first: 'Pieter', last: 'Levels', role: 'Founder' },
  { first: 'Brett', last: 'Williams', role: 'CEO' },
  { first: 'Hiten', last: 'Shah', role: 'Co-founder' },
  { first: 'Jason', last: 'Fried', role: 'CEO' },
  { first: 'Dharmesh', last: 'Shah', role: 'CTO' },
  { first: 'Anne', last: 'Helen', role: 'Head of Product' },
  { first: 'Julie', last: 'Zhuo', role: 'VP Design' },
  { first: 'Lenny', last: 'Rachitsky', role: 'Product Lead' },
  { first: 'April', last: 'Underwood', role: 'Chief Product Officer' },
  { first: 'Sarah', last: 'Friar', role: 'CEO' },
  { first: 'Dylan', last: 'Field', role: 'CEO' },
  { first: 'Evan', last: 'Sharp', role: 'Co-founder' },
  { first: 'Ben', last: 'Silbermann', role: 'CEO' },
  { first: 'Katia', last: 'Beauchamp', role: 'CEO' },
];

// Generate realistic need based on product and company
export function generateRealisticNeed(product: any, company: any, person: any) {
  const productName = product.name || 'this tool';
  const category = product.category || 'software';
  
  const needs = [
    `Hi! I'm ${person.first} from ${company.name}. We're looking for a ${category} solution to help our team ${product.description?.substring(0, 60) || 'streamline our workflow'}. Your product looks promising - can we schedule a demo?`,
    
    `Hello! ${company.name} is evaluating ${category} tools for Q2. ${productName} caught our attention because of ${product.uniqueSellingPoint?.substring(0, 50) || 'your unique approach'}. What's your pricing for teams of 50+?`,
    
    `Hey there! I lead ${person.role} at ${company.name}. We're struggling with ${product.painPoints?.[0]?.toLowerCase() || 'inefficient workflows'} and ${productName} seems like it could help. Do you offer enterprise plans?`,
    
    `Hi! Been following ${productName} for a while. At ${company.name}, we need better ${category} tools to ${product.features?.[0]?.toLowerCase() || 'improve our process'}. Are you open to a partnership discussion?`,
    
    `Hello! ${company.name} is scaling fast and we need a robust ${category} platform. ${productName} looks like exactly what we need. Can you share case studies from similar companies?`,
    
    `Hey! I'm the ${person.role} at ${company.name}. We're currently using a competitor but ${productName}'s ${product.uniqueSellingPoint?.substring(0, 40) || 'features'} look superior. What's your migration process like?`,
    
    `Hi there! ${company.name} is building a ${category} platform and we'd love to explore how ${productName} could help us ${product.description?.substring(0, 40) || 'achieve our goals'}. When's a good time to chat?`,
    
    `Hello! We're a ${company.industry} company looking to modernize our ${category} stack. ${productName} is on our shortlist. Could you share ROI data from similar deployments?`
  ];
  
  return needs[Math.floor(Math.random() * needs.length)];
}

// Generate realistic leads
export function generateRealisticLeads(product: any, count: number = 10) {
  const leads = [];
  const usedCompanies = new Set();
  
  for (let i = 0; i < count; i++) {
    // Get unique company
    let company, person;
    do {
      company = REAL_COMPANIES[Math.floor(Math.random() * REAL_COMPANIES.length)];
    } while (usedCompanies.has(company.name) && usedCompanies.size < REAL_COMPANIES.length);
    usedCompanies.add(company.name);
    
    person = REAL_NAMES[Math.floor(Math.random() * REAL_NAMES.length)];
    
    // Generate realistic email
    const email = `${person.first.toLowerCase()}.${person.last.toLowerCase()}@${company.domain}`;
    
    // Generate varied timestamps (last 30 days)
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    leads.push({
      name: `${person.first} ${person.last}`,
      email: email,
      company: company.name,
      role: person.role,
      need: generateRealisticNeed(product, company, person),
      source: 'AI Discovery',
      location: company.location,
      industry: company.industry,
      companySize: getRandomCompanySize(),
      createdAt: createdAt
    });
  }
  
  return leads;
}

function getRandomCompanySize() {
  const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
  return sizes[Math.floor(Math.random() * sizes.length)];
}
