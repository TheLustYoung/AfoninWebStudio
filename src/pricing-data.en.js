// Source: Afonin-Web-Studio-Presentation.pdf, pages 5–48.
export const categories = [
  { id: 'websites', number: '01', title: 'Turnkey Websites', intro: 'Design, copy, development and launch — a ready-made sales tool.' },
  { id: 'automation', number: '02', title: 'Bots, AI & Automation', intro: 'Proven solutions that we configure for your business.' },
  { id: 'webapps', number: '03', title: 'Web Applications', intro: 'Custom development built around your processes. The code, data and rights are yours.' },
  { id: 'support', number: '04', title: 'Support', intro: 'Maintenance, updates and growth for your project after launch.' }
];
export const services = [
  {
    id: 'landing', category: 'websites', label: 'Start', title: 'Landing Page', price: '120,000 ֏', duration: '7 business days', scope: '1 language · a single page, up to 7 sections',
    includes: ['Brief and structure', 'Copy for every section', 'Free first-screen mockup', 'Design and build', 'Form → Telegram / WhatsApp', 'SEO, analytics, launch'],
    needs: ['Description of your service and prices', 'Photos and logo', 'Client testimonials', 'Domain (or we buy it for you)'],
    extras: [['Extra language with proofreading', '+30%'], ['Telegram booking bot', 'from 90,000 ֏'], ['Support plan', 'from 20,000 ֏/mo']]
  },
  {
    id: 'company', category: 'websites', label: 'Business', badge: 'Popular', title: 'Company Website', price: '280,000 ֏', duration: '14 business days', scope: '2 languages · up to 8 pages',
    includes: ['Brief and competitor analysis', 'Sitemap and copy', 'Design for every page', 'Development and admin panel', 'SEO, analytics, Google Maps', 'Training and a month of support'],
    needs: ['List of services and prices', 'Team and work photos', 'Client testimonials', 'Domain access'],
    extras: [['Third language with proofreading', '+30%'], ['AI assistant on the site', 'from 200,000 ֏'], ['"Growth" support with SEO articles', '80,000 ֏/mo']]
  },
  {
    id: 'shop', category: 'websites', label: 'Sales', title: 'Online Store', price: 'from 480,000 ֏', duration: 'from 25 business days', scope: '3 languages · HY, RU, EN',
    includes: ['Catalog structure', 'Design for every page', 'Product import', 'Cart, shipping, payment', 'Admin panel and notifications', 'SEO, analytics, 2 months of support'],
    needs: ['Products in Excel', 'Product photos', 'Shipping and return terms', 'Bank agreement for payments'],
    extras: [['Telegram catalog bot', 'from 180,000 ֏'], ['Integration with accounting software', 'from 60,000 ֏'], ['AI assistant for shoppers', 'from 200,000 ֏']]
  },
  {
    id: 'booking-bot', category: 'automation', label: 'Online Booking', title: 'Telegram Booking Bot', price: 'from 90,000 ֏', duration: '7–10 business days', scope: 'Client bookings and reminders · 3 languages',
    includes: ['Script and copy in 3 languages', 'Setup of services, staff and schedules', 'Reminders for clients', 'Notifications for the admin', 'Booking list for staff', 'Staff training'],
    needs: ['List of services with prices and duration', 'Staff and their work schedules', 'Logo and photos (optional)', "Administrator's Telegram account"],
    extras: [['Bookings synced to Google Sheets or CRM', 'from 40,000 ֏'], ['AI assistant for client questions', 'from 200,000 ֏'], ['Support and improvements', 'from 20,000 ֏/mo']]
  },
  {
    id: 'catalog-bot', category: 'automation', label: 'Telegram Sales', title: 'Order Catalog Bot', price: 'from 180,000 ֏', duration: '14–20 business days', scope: 'Catalog, cart, payment and order statuses',
    includes: ['Catalog with categories', 'Product import from Excel', 'Cart and checkout', 'Payment-link integration', 'Statuses and notifications', 'Instructions for updating products'],
    needs: ['Product list in Excel with prices', 'Product photos', 'Delivery and pickup terms', 'Payment gateway details'],
    extras: [['Online store on your website', 'from 480,000 ֏'], ['Orders synced to a sheet or CRM', 'from 40,000 ֏'], ['Support and improvements', 'from 20,000 ֏/mo']]
  },
  {
    id: 'ai-assistant', category: 'automation', label: 'Always Available', title: 'AI Assistant 24/7', price: 'from 200,000 ֏', recurring: '+ 15,000 ֏/mo', duration: '14 business days', scope: 'Answers from your knowledge base · HY, RU, EN',
    includes: ['Building your knowledge base', 'Tone and language setup', 'Connecting your channels', 'Handoff rules to a manager', 'Testing on real questions', 'Monthly knowledge base updates'],
    needs: ['List of services and prices', 'Frequently asked questions', 'Instagram and WhatsApp Business access', "Manager's contact for handoff"],
    extras: [['Booking bot paired with the assistant', 'from 90,000 ֏'], ['Leads synced to a sheet or CRM', 'from 40,000 ֏'], ['Company website', '280,000 ֏']]
  },
  {
    id: 'leads', category: 'automation', label: 'Lead Collection', title: 'Leads to Sheet or CRM', price: 'from 40,000 ֏', duration: '2–3 business days', scope: 'Leads from every source in one place',
    includes: ['Audit of lead sources', 'Unified lead format', 'Connecting your sources', 'Telegram notifications', 'Verification with test leads', 'Quick guide for your team'],
    needs: ['List of lead sources', 'Access to your site and forms', 'A sheet or CRM (or we set one up)', 'Who receives notifications'],
    extras: [['AI assistant for the first reply', 'from 200,000 ֏'], ['Automated Telegram reports', 'from 60,000 ֏'], ['Support plan', 'from 20,000 ֏/mo']]
  },
  {
    id: 'admin', category: 'automation', label: 'Business Management', title: 'Admin Panel & Records', price: 'from 350,000 ֏', duration: 'from 20 business days', scope: 'Modules, staff roles and data migration',
    includes: ['Interviews and planning', 'Interface prototype', 'Module development', 'Roles and access rights', 'Data migration from Excel', 'Training and backups'],
    needs: ['Current spreadsheets and documents', 'Description of your workflows', 'List of staff roles', 'Time for 2–3 meetings'],
    extras: [['Integrations with other services', 'from 60,000 ֏'], ['Automated Telegram reports', 'from 60,000 ֏'], ['"Standard" support plan', '40,000 ֏/mo']]
  },
  {
    id: 'integrations', category: 'automation', label: 'Connecting Services', title: 'Integrations & API', price: 'from 60,000 ֏', duration: 'depends on scope', scope: 'Data exchange between your services',
    includes: ['API documentation review', 'Data exchange design', 'Connector development', 'Error handling', 'Operations log', 'Testing and launch'],
    needs: ['List of services to connect', 'API access (keys)', 'Sample data', 'A point of contact on your side'],
    extras: [['Admin panel & records', 'from 350,000 ֏'], ['Automated reports', 'from 60,000 ֏'], ['Support plan', 'from 20,000 ֏/mo']]
  },
  {
    id: 'custom-app', category: 'webapps', label: 'Custom Development', title: 'Web Application', price: 'from 800,000 ֏', duration: 'timeline and price — by spec', scope: 'Client portal · CRM · booking · B2B platform',
    includes: ['Discovery and specification', 'Clickable prototype', 'Architecture and security', 'Development in sprints with demos', 'Testing on every device', 'Launch and team training'],
    needs: ['Description of the task and goals', 'Time for interviews', 'A person responsible for sign-off', 'Access to your current systems'],
    extras: [['Integrations & API', 'from 60,000 ֏'], ['AI features in the app', 'by quote'], ['Support and growth', 'from 80,000 ֏/mo']],
    note: 'Payment in stages: 40 / 30 / 30. Quote provided after reviewing the task.'
  }
];
export const supportPlans = [
  { id: 'basic', title: 'Basic', price: '20,000 ֏', response: 'Response within 24 hours', includes: ['Hosting and SSL monitored', 'Weekly backups', 'Downtime monitoring', '1 hour of edits per month'] },
  { id: 'standard', title: 'Standard', price: '40,000 ֏', response: 'Response within 12 hours', includes: ['Everything in "Basic"', '4 hours of edits per month', 'Updates to prices, promos, photos', 'Monthly lead report'] },
  { id: 'growth', title: 'Growth', price: '80,000 ֏', response: 'Response within 4 business hours', includes: ['Everything in "Standard"', '8 hours of edits per month', '2 SEO articles per month', 'Google Business management'] }
];
