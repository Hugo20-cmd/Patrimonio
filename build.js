const fs = require('fs');

// 1. simulator.ts
let simCode = fs.readFileSync('app/actions/simulator.ts', 'utf8');
const newFunc = fs.readFileSync('ranking_func.txt', 'utf8');
fs.writeFileSync('app/actions/simulator.ts', simCode + '\n' + newFunc, 'utf8');

// 2. page.tsx
let pageCode = fs.readFileSync('app/(dashboard)/simulador/page.tsx', 'utf8');
pageCode = pageCode.replace(
  'import { getSimulatorAccount, getSimulatorPositions, getSimulatorHistory } from "@/app/actions/simulator";',
  'import { getSimulatorAccount, getSimulatorPositions, getSimulatorHistory, getSimulatorRanking } from "@/app/actions/simulator";'
);
pageCode = pageCode.replace(
  'const history = await getSimulatorHistory();',
  'const history = await getSimulatorHistory();\n  const ranking = await getSimulatorRanking();'
);
pageCode = pageCode.replace(
  'initialQuotes={quotes}',
  'initialQuotes={quotes}\n      initialRanking={ranking}'
);
fs.writeFileSync('app/(dashboard)/simulador/page.tsx', pageCode, 'utf8');

// 3. simulador-client.tsx
let clientCode = fs.readFileSync('app/(dashboard)/simulador/simulador-client.tsx', 'utf8');

clientCode = clientCode.replace(
  'export default function SimuladorClient({ initialAccount, initialPositions, initialHistory, initialQuotes = [] }: any) {',
  'import { Trophy, Medal, Award } from "lucide-react";\nexport default function SimuladorClient({ initialAccount, initialPositions, initialHistory, initialQuotes = [], initialRanking = [] }: any) {'
);

clientCode = clientCode.replace(
  'const [account, setAccount] = useState(initialAccount);',
  'const [activeTab, setActiveTab] = useState<"trade" | "ranking">("trade");\n  const [account, setAccount] = useState(initialAccount);'
);

// Tabs
const headerEnd = '<p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Treine suas estratégias com dinheiro virtual e cotações reais.</p>\n        </div>';
const tabsUi = fs.readFileSync('tabs_ui.txt', 'utf8');
clientCode = clientCode.replace(headerEnd, tabsUi);

// Tab condition wrapper start
const gridStart = '{/* Ticker Tape Widgets or Overview Metrics */}';
const rankingTable = fs.readFileSync('ranking_table.txt', 'utf8');
clientCode = clientCode.replace(gridStart, rankingTable);

// Tab condition wrapper end
const endTag = '    </motion.div>\n  );\n}';
const endTagNew = '        </>\n      )}\n    </motion.div>\n  );\n}';
clientCode = clientCode.replace(endTag, endTagNew);

fs.writeFileSync('app/(dashboard)/simulador/simulador-client.tsx', clientCode, 'utf8');

console.log('SUCCESS');
