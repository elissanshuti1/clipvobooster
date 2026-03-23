// Script to initialize admin account in MongoDB
// Run with: node scripts/init-admin.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb+srv://nshuti:nyamata123@cluster0.ocwbtwt.mongodb.net/clipvobooster?retryWrites=true&w=majority&ssl=true&tls=true';

async function initAdmin() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('clipvobooster');
    const admins = db.collection('admins');
    
    // Check if admin already exists
    const existingAdmin = await admins.findOne({ username: 'nshuti' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists');
      await client.close();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Nyamata123', 10);
    
    // Create admin
    const result = await admins.insertOne({
      username: 'nshuti',
      name: 'Nshuti Elissa',
      password: hashedPassword,
      role: 'superadmin',
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    });
    
    console.log('✅ Admin created successfully!');
    console.log('   Username: nshuti');
    console.log('   Password: Nyamata123');
    console.log('   Name: Nshuti Elissa');
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initAdmin();
