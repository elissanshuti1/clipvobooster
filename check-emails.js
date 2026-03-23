// Diagnostic script to check email sending status
// Run with: node check-emails.js

const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://nshuti:nyamata123@cluster0.ocwbtwt.mongodb.net/clipvobooster?retryWrites=true&w=majority&ssl=true&tls=true";

async function checkEmails() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('clipvobooster');
    const sentEmails = db.collection('sent_emails');
    const users = db.collection('users');

    // Get all users
    const allUsers = await users.find({}).toArray();
    console.log(`📊 Total users: ${allUsers.length}\n`);

    // Get all sent emails
    const allEmails = await sentEmails.find({}).sort({ sentAt: -1 }).limit(20).toArray();
    
    console.log(`📧 Total sent emails in DB: ${allEmails.length}\n`);
    
    if (allEmails.length === 0) {
      console.log('❌ NO EMAILS FOUND IN DATABASE!');
      console.log('This means emails are not being saved to the database after sending.');
      return;
    }

    console.log('=== RECENT EMAILS ===\n');
    
    for (const email of allEmails) {
      const user = await users.findOne({ _id: email._id.toString() === email.userId ? email._id : new (require('mongodb').ObjectId)(email.userId) });
      
      console.log(`📩 Email Details:`);
      console.log(`   ID: ${email._id}`);
      console.log(`   User ID: ${email.userId}`);
      console.log(`   User Email: ${user?.email || 'NOT FOUND'}`);
      console.log(`   To: ${email.to}`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Status: ${email.status}`);
      console.log(`   Message ID: ${email.messageId}`);
      console.log(`   Tracking ID: ${email.trackingId}`);
      console.log(`   Sent At: ${email.sentAt}`);
      console.log(`   Opened: ${email.opened}`);
      console.log(`   Open Count: ${email.openCount}`);
      console.log(`   Click Count: ${email.clickCount}`);
      console.log('---\n');
    }

    // Check for userId format issues
    console.log('\n=== USER ID FORMAT CHECK ===');
    const userIdFormats = allEmails.map(e => ({
      id: e._id,
      userIdType: typeof e.userId,
      userId: e.userId,
      isObjectId: e.userId.constructor.name === 'ObjectId'
    }));
    
    console.log('User ID formats found:');
    userIdFormats.forEach(format => {
      console.log(`  - Type: ${format.userIdType}, Is ObjectId: ${format.isObjectId}, Value: ${format.userId}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed');
  }
}

checkEmails().catch(console.error);
