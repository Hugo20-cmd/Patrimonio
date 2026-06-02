const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/actions/assets.ts',
  'app/actions/chat.ts',
  'app/actions/forum.ts',
  'app/actions/news.ts'
];

for (const file of filesToFix) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace select('plan') with select('id') or remove plan from select
  content = content.replace(/\.select\('plan'\)/g, ".select('id')");
  content = content.replace(/\.select\('plan,\s*email'\)/g, ".select('email')");
  
  // Replace profile.plan === 'premium' with actual logic
  // We already added getSubscriptionStatus to some. For assets and news, they might still check profile?.plan
  if (file === 'app/actions/assets.ts' || file === 'app/actions/news.ts' || file === 'app/actions/forum.ts') {
    // Inject getSubscriptionStatus if not there
    if (!content.includes('getSubscriptionStatus')) {
      content = content.replace(
        "import { createClient } from '@/utils/supabase/server'",
        "import { createClient } from '@/utils/supabase/server'\nimport { getSubscriptionStatus } from '@/app/actions/subscription'"
      );
    }
    
    // Replace profile logic
    content = content.replace(
      "const isPremium = profile?.plan === 'premium'",
      "const sub = await getSubscriptionStatus();\n  const isPremium = sub.status === 'premium'"
    );
    
    content = content.replace(
      /if\s*\(\s*profile\?\.plan\s*!==\s*'premium'\s*\)/g,
      "const sub = await getSubscriptionStatus();\n  if (sub.status !== 'premium')"
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log("Fixed files!");
