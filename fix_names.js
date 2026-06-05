const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: usersData, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  
  const users = usersData.users;
  let updatedCount = 0;
  
  for (const user of users) {
    const metaName = user.user_metadata?.name;
    if (metaName) {
      // Check if profile has null name
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
      if (profile && !profile.name) {
        console.log(`Updating user ${user.email} with name ${metaName}`);
        await supabase.from('profiles').update({ name: metaName }).eq('id', user.id);
        updatedCount++;
      }
    }
  }
  
  console.log(`Updated ${updatedCount} profiles.`);
}
run();
