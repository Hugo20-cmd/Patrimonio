const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qgzgkzhepflqyfwkaaoo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnemdremhlcGZscXlmd2thYW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAyMDMxMywiZXhwIjoyMDk1NTk2MzEzfQ.-WN2nbaPMVaQw2js0jfyGi3Z26RbnLJTM-HqfcYeLFc'
);

async function check() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log(`Found ${users.length} users in Supabase Auth (auth.users).`);
    users.forEach(u => console.log(`- ${u.email} (Created: ${u.created_at})`));
  }
}

check();
