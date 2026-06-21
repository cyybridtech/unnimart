import { useState } from 'react';
import { Terminal, Database, Code, GitFork, Play, Copy, Check, ShieldAlert } from 'lucide-react';
import { type User, Product, Order, SellerProfile, ApiLog, BACKEND_CODE_SNIPPETS } from '../data/mockData';

interface SystemConsoleProps {
  users: User[];
  products: Product[];
  orders: Order[];
  sellerProfiles: SellerProfile[];
  apiLogs: ApiLog[];
  onClearLogs: () => void;
  onExecuteRawSql: (sql: string) => { success: boolean; message: string; rows?: any[] };
}

export default function SystemConsole({
  users,
  products,
  orders,
  sellerProfiles,
  apiLogs,
  onClearLogs,
  onExecuteRawSql
}: SystemConsoleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'database' | 'logs' | 'code' | 'architecture'>('logs');
  const [selectedDbTable, setSelectedDbTable] = useState<'users' | 'products' | 'orders' | 'seller_profiles'>('users');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM products WHERE is_preorder = 1;');
  const [sqlResult, setSqlResult] = useState<{ success: boolean; message: string; rows?: any[] } | null>(null);
  const [selectedCodeSnippet, setSelectedCodeSnippet] = useState<keyof typeof BACKEND_CODE_SNIPPETS>('serverJs');
  const [copiedText, setCopiedText] = useState(false);

  const PRESET_SQL_QUERIES = [
    { label: 'Select All Products', query: 'SELECT * FROM products;' },
    { label: 'Find Active Pre-orders', query: 'SELECT name, price, stock FROM products WHERE is_preorder = 1;' },
    { label: 'Find Pending Orders', query: "SELECT id, buyer_name, total_amount FROM orders WHERE status = 'pending';" },
    { label: 'Add $500 to Jordan (Buyer)', query: "UPDATE users SET balance = balance + 500 WHERE username = 'jordan_buyer';" },
    { label: 'View Verified Sellers', query: 'SELECT user_id, business_name, category FROM seller_profiles WHERE verified = 1;' }
  ];

  const handleRunSql = () => {
    if (!sqlQuery.trim()) return;
    const result = onExecuteRawSql(sqlQuery);
    setSqlResult(result);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(BACKEND_CODE_SNIPPETS[selectedCodeSnippet]);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Get current table data
  const getTableData = () => {
    switch (selectedDbTable) {
      case 'users': return users;
      case 'products': return products;
      case 'orders': return orders;
      case 'seller_profiles': return sellerProfiles;
    }
  };

  const getTableColumns = () => {
    const data = getTableData();
    if (data.length === 0) return [];
    // For orders, flatten items or exclude to prevent messy nested objects in table
    const keys = Object.keys(data[0]);
    return keys.filter(k => k !== 'items' && k !== 'avatar_url');
  };

  return (
    <div className="space-y-6">
      
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            System Architecture & DB Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-stack simulation terminal. Inspect real-time relational tables, execute raw SQL queries, browse API logs, and explore Node.js production code.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'database' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            MySQL DB
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'logs' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            API Logs
          </button>
          <button
            onClick={() => setActiveSubTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'code' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Node.js Code
          </button>
          <button
            onClick={() => setActiveSubTab('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'architecture' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="h-3.5 w-3.5" />
            Architecture
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: DATABASE RELATIONAL TABLES & SQL SANDBOX */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          
          {/* SQL Editor Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-500" />
                Raw SQL Query Sandbox (MySQL v8.0.32)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">DATABASE: unimart_db</span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Textarea editor */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-emerald-400 font-mono focus:outline-hidden resize-none"
                      placeholder="SELECT * FROM products WHERE price > 20;"
                    />
                    <button
                      onClick={handleRunSql}
                      className="absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-white" /> Run SQL
                    </button>
                  </div>

                  {/* Preset Buttons */}
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Click to load template queries:</span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_SQL_QUERIES.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSqlQuery(p.query);
                            setSqlResult(null);
                          }}
                          className="bg-slate-900 border border-slate-850 hover:border-slate-750 text-[10px] px-2.5 py-1 rounded-lg text-slate-300 hover:text-emerald-400 font-medium transition-all cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Developer Instructions */}
                <div className="lg:col-span-4 bg-slate-900/50 border border-slate-850 rounded-xl p-4 text-[11px] text-slate-300 space-y-2.5">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                    Simulated MySQL Engine Rules
                  </h4>
                  <p className="leading-relaxed text-slate-400">
                    Our mock engine compiles standard SQL statements in memory. It supports:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 font-mono text-[10px]">
                    <li>SELECT [cols] FROM [table]</li>
                    <li>WHERE [col] = [val] (or &gt;, &lt;, LIKE)</li>
                    <li>UPDATE [table] SET [col] = [val] WHERE [col] = [val]</li>
                  </ul>
                  <p className="text-slate-500 text-[10px] leading-relaxed">
                    Executing an <span className="font-bold text-yellow-500">UPDATE</span> statement actually modifies the application's mock state, showing you real database reactivity.
                  </p>
                </div>

              </div>

              {/* SQL Result Terminal Display */}
              {sqlResult && (
                <div className="border-t border-slate-850 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Terminal output:</span>
                    <span className={sqlResult.success ? 'text-emerald-500' : 'text-rose-500'}>
                      {sqlResult.success ? '⚡ SUCCESS' : '❌ ERROR'}
                    </span>
                  </div>

                  {!sqlResult.success ? (
                    <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-lg text-xs font-mono text-rose-400">
                      {sqlResult.message}
                    </div>
                  ) : (
                    <div className="bg-slate-900 rounded-xl border border-slate-850 p-4 space-y-3 overflow-x-auto font-mono text-xs">
                      <p className="text-slate-400 text-[10px]">{sqlResult.message}</p>
                      
                      {sqlResult.rows && sqlResult.rows.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-950/40">
                              {Object.keys(sqlResult.rows[0]).map((key, i) => (
                                <th key={i} className="py-1.5 px-2.5">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40 text-slate-300">
                            {sqlResult.rows.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-950/20">
                                {Object.values(row).map((val: any, idx) => (
                                  <td key={idx} className="py-1.5 px-2.5">
                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-slate-500 italic text-[11px]">Empty set (0.00 sec)</p>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* MySQL Table Registry Viewer */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-md">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-emerald-400" />
                  Live Relational Tables (MySQL Entity Models)
                </h3>
                <p className="text-[10px] text-slate-400">Select a table to inspect the currently stored relational records.</p>
              </div>

              {/* Table Selector Pills */}
              <div className="flex flex-wrap gap-1 bg-slate-950 border border-slate-850 p-1 rounded-xl text-xs font-semibold">
                {(['users', 'products', 'orders', 'seller_profiles'] as const).map((table) => (
                  <button
                    key={table}
                    onClick={() => setSelectedDbTable(table)}
                    className={`px-3 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                      selectedDbTable === table ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {table.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Table rendering */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[9px] bg-slate-950/20">
                    {getTableColumns().map((col, i) => (
                      <th key={i} className="py-2 px-3 font-mono">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-medium font-mono text-slate-300">
                  {getTableData().map((row: any, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-950/40 transition-colors">
                      {getTableColumns().map((col, colIndex) => (
                        <td key={colIndex} className="py-2.5 px-3">
                          {row[col] === null ? (
                            <span className="text-slate-700 font-bold">NULL</span>
                          ) : typeof row[col] === 'boolean' ? (
                            <span className={row[col] ? 'text-emerald-400' : 'text-slate-500'}>
                              {row[col] ? '1' : '0'}
                            </span>
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono">
              <span>{getTableData().length} rows in set</span>
              <span>Primary Key: {selectedDbTable === 'seller_profiles' ? 'user_id' : 'id'}</span>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: NODE.JS API LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[600px]">
          
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-emerald-400 animate-pulse" />
              Node.js Express Server console.log (HTTP requests)
            </span>
            <button
              onClick={onClearLogs}
              className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-805 px-2.5 py-1 rounded-md transition-all cursor-pointer"
            >
              Clear Console
            </button>
          </div>

          {/* Scrolling Terminal area */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-4 bg-slate-950 scrollbar-thin">
            {apiLogs.length === 0 ? (
              <div className="text-slate-600 py-12 text-center">
                <p>&gt; System initialized. Awaiting network request packages...</p>
                <p className="text-[10px] text-slate-700 mt-1">Perform checkout purchases, add products, or toggle active states to see API logs here.</p>
              </div>
            ) : (
              apiLogs.map((log) => (
                <div key={log.id} className="border-b border-slate-900 pb-3 space-y-1.5 last:border-0">
                  {/* Log header line */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-600">[{log.timestamp}]</span>
                    
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      log.method === 'GET' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                      log.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      log.method === 'PUT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {log.method}
                    </span>

                    <span className="text-slate-300 font-semibold">{log.path}</span>
                    
                    <span className={`font-bold ${
                      log.status >= 400 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {log.status}
                    </span>

                    <span className="text-slate-600 text-[10px]">({log.latency}ms)</span>
                  </div>

                  {/* SQL Execution Log */}
                  {log.sqlQuery && (
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-900/80 text-amber-500 text-[10px] pl-4">
                      <span className="text-slate-500 font-bold">MySQL Query:</span> {log.sqlQuery}
                    </div>
                  )}

                  {/* Request Payload */}
                  {log.requestBody && (
                    <div className="pl-4 text-slate-500 text-[10.5px]">
                      <span className="text-slate-600 font-semibold">Payload:</span> {log.requestBody}
                    </div>
                  )}

                  {/* Response Payload */}
                  {log.responseBody && (
                    <div className="pl-4 text-slate-500 text-[10.5px]">
                      <span className="text-slate-600 font-semibold">Response:</span> {log.responseBody}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="bg-slate-900/60 px-4 py-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono text-right">
            Listening on port 5000 | MySQL Connection Pool Connected
          </div>

        </div>
      )}

      {/* SUB-TAB 3: NODE.JS & MYSQL BACKEND CODE EXPORTER */}
      {activeSubTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* File selector column (3/12) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Backend File Structure
            </h3>
            
            <button
              onClick={() => setSelectedCodeSnippet('serverJs')}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                selectedCodeSnippet === 'serverJs' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-950 hover:text-slate-300'
              }`}
            >
              📄 server.js
            </button>

            <button
              onClick={() => setSelectedCodeSnippet('dbSchema')}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                selectedCodeSnippet === 'dbSchema' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-950 hover:text-slate-300'
              }`}
            >
              📄 config/db.js
            </button>

            <button
              onClick={() => setSelectedCodeSnippet('authController')}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                selectedCodeSnippet === 'authController' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-950 hover:text-slate-300'
              }`}
            >
              📄 routes/auth.js
            </button>

            <button
              onClick={() => setSelectedCodeSnippet('productController')}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                selectedCodeSnippet === 'productController' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-950 hover:text-slate-300'
              }`}
            >
              📄 routes/products.js
            </button>

            <button
              onClick={() => setSelectedCodeSnippet('orderController')}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                selectedCodeSnippet === 'orderController' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-950 hover:text-slate-300'
              }`}
            >
              📄 routes/orders.js
            </button>

            <div className="pt-4 border-t border-slate-800 mt-4 text-[10px] text-slate-500 px-1 leading-relaxed">
              <p className="font-bold text-slate-400">💡 Senior Ready Architecture:</p>
              <p className="mt-1">This code represents production-grade Node.js/Express, utilizing MySQL connection pools, standard bcrypt cryptography, and structured transaction operations.</p>
            </div>
          </div>

          {/* Code Viewer Panel (9/12) */}
          <div className="lg:col-span-9 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-mono text-slate-300 font-bold text-[11px]">
                {selectedCodeSnippet === 'serverJs' ? 'src/server.js' :
                 selectedCodeSnippet === 'dbSchema' ? 'src/config/db.js' :
                 selectedCodeSnippet === 'authController' ? 'src/routes/auth.js' :
                 selectedCodeSnippet === 'productController' ? 'src/routes/products.js' :
                 'src/routes/orders.js'}
              </span>

              <button
                onClick={handleCopyCode}
                className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850 transition-all cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code Text container */}
            <pre className="p-5 text-slate-300 font-mono text-xs overflow-auto max-h-[500px] leading-relaxed scrollbar-thin">
              <code>{BACKEND_CODE_SNIPPETS[selectedCodeSnippet]}</code>
            </pre>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: FULL ECOSYSTEM ARCHITECTURE */}
      {activeSubTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8">
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ecosystem Architecture Blueprint</h3>
            <p className="text-xs text-slate-400 mt-0.5">Visual mapping of how our React-Node-MySQL stack integrates for peer-to-peer university commerce.</p>
          </div>

          {/* Architecture Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3 relative group hover:border-indigo-500/50 transition-all">
              <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">React Client (SPA)</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Responsive UI designed in React with Tailwind CSS. Coordinates roles (Admin, Seller, Buyer) and dispatches JSON payloads to REST APIs.
              </p>
              <div className="text-[10px] text-indigo-400 bg-indigo-950/40 p-1.5 rounded font-mono">
                Axios / Fetch Requests
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3 relative hover:border-amber-500/50 transition-all">
              <div className="mx-auto w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-sm">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Express.js Router</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Node.js web server routing endpoints. Intercepts calls, handles JWT decoding, validates request schemas, and manages role permissions.
              </p>
              <div className="text-[10px] text-amber-400 bg-amber-950/40 p-1.5 rounded font-mono">
                JWT Auth Middlewares
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3 relative hover:border-emerald-500/50 transition-all">
              <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">MySQL Transactional Pool</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Performs concurrent operations with a thread pool. Restricts double-spending, manages item inventory locks, and applies maintenance commissions.
              </p>
              <div className="text-[10px] text-emerald-400 bg-emerald-950/40 p-1.5 rounded font-mono">
                START TRANSACTION
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3 relative hover:border-red-500/50 transition-all">
              <div className="mx-auto w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-sm">
                4
              </div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">MySQL Database</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Persists tables with rigid foreign key constraints. Stores buyer histories, seller credentials, active inventory stocks, and auditing journals.
              </p>
              <div className="text-[10px] text-red-400 bg-red-950/40 p-1.5 rounded font-mono">
                ACID Compliant Storage
              </div>
            </div>

          </div>

          {/* Deep dive details */}
          <div className="border-t border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider">⚡ Peer Transaction Lifecycle (ACID)</h4>
              <p className="leading-relaxed text-slate-400">
                When a buyer purchases an item, the Express server initializes a <strong className="text-amber-400 font-mono">MySQL TRANSACTION</strong>. It acquires a row-level lock on the product to prevent racing, checks if the buyer's balance covers the cost, deducts the amount, credits the entrepreneur (100%), decrements the product stock, and logs the order. If any step fails, the entire stack executes a <strong className="text-red-400 font-mono">ROLLBACK</strong> to guarantee data integrity.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider">🔒 Security & Authentication Architecture</h4>
              <p className="leading-relaxed text-slate-400">
                User registration salts and hashes passwords using <strong className="text-slate-200">bcryptjs</strong> before committing to the database. Authenticated logins yield a cryptographically signed <strong className="text-slate-200">JSON Web Token (JWT)</strong> carrying user role metadata. Express routers apply middleware filters (e.g., <code className="text-emerald-400">checkRole(['seller'])</code>) to verify scopes, protecting endpoints from unauthorized write attempts.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
