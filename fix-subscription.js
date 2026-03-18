// Manual script to fix subscription for user who already paid
// Run this with: node fix-subscription.js

const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://nshuti:nyamata123@cluster0.ocwbtwt.mongodb.net/clipvobooster?retryWrites=true&w=majority&ssl=true&tls=true";

async function fixSubscription() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    const checkouts = db.collection('checkouts');
    
    // Find user by email
    const email = 'elissanshuti1@gmail.com';
    const user = await users.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      return;
    }
    
    console.log('Found user:', { _id: user._id, email: user.email });
    
    // Check if user already has subscription
    if (user.subscription) {
      console.log('User already has subscription:', user.subscription);
      return;
    }
    
    // Find recent checkout for this user
    const checkout = await checkouts.findOne(
      { userId: String(user._id) },
      { sort: { createdAt: -1 } }
    );
    
    if (!checkout) {
      console.log('No checkout found for this user');
      return;
    }
    
    console.log('Found checkout:', { 
      checkoutId: checkout.checkoutId, 
      plan: checkout.plan,
      status: checkout.status 
    });
    
    // Update user's subscription
    const result = await users.updateOne(
      { _id: user._id },
      {
        $set: {
          subscription: {
            plan: checkout.plan || 'lifetime',
            planName: checkout.planDetails?.name || 'Lifetime',
            price: checkout.planDetails?.price || 60,
            interval: checkout.planDetails?.interval || 'one-time',
            status: 'active',
            startDate: new Date(),
            checkoutId: checkout.checkoutId,
            subscriptionId: checkout.subscriptionId || 'sub_0Najmy0EKeOLm1E7Wr71E',
            manuallyActivated: true
          },
          updatedAt: new Date()
        }
      }
    );
    
    console.log('Subscription activated! Modified documents:', result.modifiedCount);
    
    // Verify the update
    const updatedUser = await users.findOne({ _id: user._id });
    console.log('Updated user subscription:', updatedUser.subscription);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

fixSubscription().catch(console.error);
