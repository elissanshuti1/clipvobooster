/**
 * Daily Leads Fetch Script
 * 
 * Run this script daily to automatically find potential customers for all users
 * 
 * Usage:
 *   node scripts/fetch-daily-leads.js
 * 
 * Or with cron (every day at 9 AM):
 *   0 9 * * * cd /path/to/next && node scripts/fetch-daily-leads.js
 */

const fetch = require('node-fetch');

const PROD_URL = process.env.NEXT_PUBLIC_PROD_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';

async function fetchDailyLeads() {
  console.log('🚀 Starting daily leads fetch...');
  console.log(`📍 Target: ${PROD_URL}/api/leads/fetch-daily`);

  try {
    const response = await fetch(`${PROD_URL}/api/leads/fetch-daily`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log(`📊 Users processed: ${data.usersProcessed}`);
      console.log(`🎯 New leads found: ${data.totalNewLeads}`);
    } else {
      console.error('❌ Failed:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
fetchDailyLeads()
  .then(() => {
    console.log('✅ Daily leads fetch complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });
