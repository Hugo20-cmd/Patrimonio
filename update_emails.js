const fs = require('fs');

const filesToUpdateAdmin = [
  'app/actions/admin.ts',
  'app/actions/chat.ts',
  'app/actions/forum.ts',
  'app/actions/news.ts',
  'app/actions/subscription.ts',
  'app/(dashboard)/community/page.tsx'
];

for (const f of filesToUpdateAdmin) {
  if (fs.existsSync(f)) {
    let text = fs.readFileSync(f, 'utf8');
    text = text.replace(/\['contatopennamc@gmail\.com'\]/g, "['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']");
    fs.writeFileSync(f, text, 'utf8');
  }
}

const filesToUpdateInline = [
  'components/layout/Sidebar.tsx',
  'components/layout/TopBar.tsx',
  'app/(dashboard)/academia/page.tsx',
  'app/actions/chat.ts'
];

for (const f of filesToUpdateInline) {
  if (fs.existsSync(f)) {
    let text = fs.readFileSync(f, 'utf8');
    text = text.replace(/profile\?\.email === 'contatopennamc@gmail\.com'/g, "['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br'].includes(profile?.email || '')");
    text = text.replace(/data\.user\?\.email === "contatopennamc@gmail\.com"/g, "['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br'].includes(data.user?.email || '')");
    fs.writeFileSync(f, text, 'utf8');
  }
}

let supportTs = fs.readFileSync('app/actions/support.ts', 'utf8');
supportTs = supportTs.replace(/to: 'contatopennamc@gmail\.com'/g, "to: 'suporte@patrimoniomais.com.br'");
supportTs = supportTs.replace(/from: 'Suporte Patrimônio\+ <onboarding@resend\.dev>'/g, "from: 'Patrimônio+ <suporte@patrimoniomais.com.br>'");
fs.writeFileSync('app/actions/support.ts', supportTs, 'utf8');

let emailsTs = fs.readFileSync('app/actions/emails.ts', 'utf8');
emailsTs = emailsTs.replace(/to: \['contatopennamc@gmail\.com'\]/g, "to: ['suporte@patrimoniomais.com.br']");
emailsTs = emailsTs.replace(/from: 'Patrimônio\+ <onboarding@resend\.dev>'/g, "from: 'Patrimônio+ <suporte@patrimoniomais.com.br>'");
fs.writeFileSync('app/actions/emails.ts', emailsTs, 'utf8');

let assetsTs = fs.readFileSync('app/actions/assets.ts', 'utf8');
const search = "const isFree = profile?.plan === 'Free' || !profile?.plan;";
const replace = "const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br'];\n  const isAdmin = ADMIN_EMAILS.includes(userData.user.email?.toLowerCase().trim() || '');\n  const isFree = !isAdmin && (profile?.plan === 'Free' || profile?.plan === 'free' || !profile?.plan);";
assetsTs = assetsTs.split(search).join(replace);
fs.writeFileSync('app/actions/assets.ts', assetsTs, 'utf8');
