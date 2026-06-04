const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qgzgkzhepflqyfwkaaoo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnemdremhlcGZscXlmd2thYW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAyMDMxMywiZXhwIjoyMDk1NTk2MzEzfQ.-WN2nbaPMVaQw2js0jfyGi3Z26RbnLJTM-HqfcYeLFc'
);

async function check() {
  console.log("Checking profiles...");
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error("Error querying profiles:", error.message);
  } else {
    console.log(`Found ${data.length} profiles.`);
    console.log(data);
  }

  console.log("Checking feedbacks...");
  const { data: fData, error: fError } = await supabase.from('feedbacks').select('*');
  if (fError) {
    console.error("Error querying feedbacks:", fError.message);
  } else {
    console.log(`Found ${fData.length} feedbacks.`);
    console.log(fData);
  }
}

check();
