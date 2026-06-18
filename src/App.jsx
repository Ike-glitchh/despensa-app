import { useState } from "react";

// ─── Storage ───────────────────────────────────────────────────────
const STORAGE_KEY = "despensa_v1";
const defaultItems = [
  { id: 1, name: "Papa", qty: 3, unit: "kg", cat: "verduras", max: 5 },
  { id: 2, name: "Camote", qty: 1.5, unit: "kg", cat: "verduras", max: 3 },
  { id: 3, name: "Tomate", qty: 0.8, unit: "kg", cat: "verduras", max: 2 },
  { id: 4, name: "Cebolla", qty: 2, unit: "kg", cat: "verduras", max: 4 },
  { id: 5, name: "Ajo", qty: 0.2, unit: "kg", cat: "verduras", max: 0.5 },
  { id: 6, name: "Pollo", qty: 1.2, unit: "kg", cat: "carnes", max: 3 },
  { id: 7, name: "Carne de res", qty: 0.5, unit: "kg", cat: "carnes", max: 2 },
  { id: 8, name: "Huevo", qty: 8, unit: "unidades", cat: "lacteos", max: 12 },
  { id: 9, name: "Leche", qty: 0, unit: "litros", cat: "lacteos", max: 2 },
  { id: 10, name: "Arroz", qty: 1.5, unit: "kg", cat: "abarrotes", max: 5 },
  { id: 11, name: "Aceite", qty: 0.7, unit: "litros", cat: "abarrotes", max: 1 },
  { id: 12, name: "Fideos", qty: 2, unit: "paquetes", cat: "abarrotes", max: 4 },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { items: defaultItems, recipes: [], logs: [] };
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── API ───────────────────────────────────────────────────────────
async function callClaude(prompt, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}

async function callClaudeWithImage(base64Image, mediaType) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64Image },
          },
          {
            type: "text",
            text: `Analiza esta imagen e identifica todos los ingredientes o alimentos que ves. Responde SOLO con JSON válido, sin texto adicional, sin markdown, sin backticks. Formato exacto: [{"name":"nombre en español","qty":1,"unit":"unidades o kg o litros según corresponda","cat":"verduras o carnes o lacteos o abarrotes"}]. Sé específico con los nombres (ej: "Papa amarilla" no solo "Papa"). Si no ves ingredientes claros, devuelve [].`
          }
        ],
      }],
    }),
  });
  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}

// ─── Icons ─────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const paths = {
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    check: "M20 6L9 17l-5-5",
    alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    book: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 22h16v-5H6.5A2.5 2.5 0 004 19.5zM20 2H6.5A2.5 2.5 0 004 4.5v15M8 7h8M8 11h5",
    clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
    x: "M18 6L6 18M6 6l12 12",
    sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM4 17l.75 2.25L7 20l-2.25.75L4 23l-.75-2.25L1 20l2.25-.75L4 17zM19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3z",
    chefhat: "M6 13.87A4 4 0 017.41 6a5.11 5.11 0 0111.18 0A4 4 0 0118 13.87V21H6v-7.13zM6 17h12",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    camera: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
};

// ─── Constants ─────────────────────────────────────────────────────
const CATS = [
  { id: "all", label: "Todos", emoji: "🗂️" },
  { id: "verduras", label: "Verduras", emoji: "🥦" },
  { id: "carnes", label: "Carnes", emoji: "🥩" },
  { id: "lacteos", label: "Lácteos", emoji: "🧀" },
  { id: "abarrotes", label: "Abarrotes", emoji: "🫙" },
];
const CAT_EMOJI = { verduras: "🥦", carnes: "🥩", lacteos: "🧀", abarrotes: "🫙" };
const UNITS = ["kg", "g", "unidades", "litros", "ml", "paquetes", "tazas"];

const TABS = [
  { id: "stock", icon: "list", label: "Stock" },
  { id: "recetas", icon: "chefhat", label: "Recetas" },
  { id: "mias", icon: "star", label: "Guardadas" },
  { id: "historial", icon: "clock", label: "Historial" },
];

function getStatus(item) {
  if (item.qty <= 0) return "empty";
  if (item.qty / item.max < 0.3) return "low";
  return "ok";
}
function round(n) { return Math.round(n * 10) / 10; }

// ─── Styles ────────────────────────────────────────────────────────
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 15, color: "#111827", background: "#fff", boxSizing: "border-box", outline: "none" };
const btnPrimary = { background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const btnGhost = { background: "none", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 10, padding: "11px 16px", fontSize: 14, cursor: "pointer" };

// ─── Small components ──────────────────────────────────────────────
function StatusDot({ status }) {
  const colors = { ok: "#4ade80", low: "#f59e0b", empty: "#f87171" };
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colors[status], flexShrink: 0 }} />;
}

function Badge({ children, color = "gray" }) {
  const palettes = {
    green: { bg: "#dcfce7", text: "#166534" },
    amber: { bg: "#fef3c7", text: "#92400e" },
    gray: { bg: "#f3f4f6", text: "#374151" },
  };
  const p = palettes[color];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: p.bg, color: p.text, borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 500 }}>
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "1.5rem 1.5rem 2.5rem", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{title}</span>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#6b7280", borderRadius: 99, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ItemCard({ item, onAdjust, onEdit, onDelete }) {
  const status = getStatus(item);
  const borderColor = status === "empty" ? "#fca5a5" : status === "low" ? "#fcd34d" : "#e5e7eb";
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${borderColor}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{CAT_EMOJI[item.cat]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 3 }}>{item.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <StatusDot status={status} />
          <span style={{ fontSize: 12, color: "#6b7280" }}>{status === "ok" ? "En stock" : status === "low" ? "Bajo stock" : "Agotado"}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={() => onAdjust(item.id, -0.5)} style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="minus" size={15} />
        </button>
        <div style={{ textAlign: "center", minWidth: 44 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{item.qty}</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.unit}</div>
        </div>
        <button onClick={() => onAdjust(item.id, 0.5)} style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="plus" size={15} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(item)} style={{ background: "#f3f4f6", border: "none", cursor: "pointer", padding: 7, borderRadius: 8, color: "#374151", display: "flex" }}>
          <Icon name="edit" size={14} />
        </button>
        <button onClick={() => onDelete(item.id)} style={{ background: "#fee2e2", border: "none", cursor: "pointer", padding: 7, borderRadius: 8, color: "#dc2626", display: "flex" }}>
          <Icon name="trash" size={14} />
        </button>
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onView, showDelete, onDelete }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer", position: "relative", active: { opacity: 0.8 } }}
      onClick={() => onView(recipe)}>
      {showDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }}
          style={{ position: "absolute", top: 12, right: 12, background: "#fee2e2", border: "none", cursor: "pointer", color: "#dc2626", borderRadius: 8, padding: 6, display: "flex" }}>
          <Icon name="trash" size={14} />
        </button>
      )}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.3, paddingRight: showDelete ? 36 : 0 }}>{recipe.title}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {recipe.missing?.length === 0
          ? <Badge color="green"><Icon name="check" size={12} />Tienes todo</Badge>
          : <Badge color="amber"><Icon name="alert" size={12} />Te falta algo</Badge>}
        {recipe.time && <Badge color="gray"><Icon name="clock" size={12} />{recipe.time}</Badge>}
      </div>
      {recipe.missing?.length > 0 && (
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          <span style={{ marginRight: 4 }}>Falta:</span>
          {recipe.missing.map((m) => (
            <span key={m} style={{ display: "inline-block", background: "#fef9c3", color: "#713f12", borderRadius: 4, padding: "2px 8px", fontSize: 12, marginRight: 4, marginBottom: 2 }}>{m}</span>
          ))}
        </div>
      )}
      <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.4 }}>{recipe.description}</div>
    </div>
  );
}

function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "1.5rem 1.5rem 3rem", width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: "#e5e7eb", borderRadius: 99, margin: "0 auto 1.25rem" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{title}</span>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", cursor: "pointer", borderRadius: 99, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────
export default function DespensaApp() {
  const [data, setData] = useState(() => loadData());
  const { items, recipes, logs } = data;

  const [tab, setTab] = useState("stock");
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewRecipe, setViewRecipe] = useState(null);
  const [editRecipe, setEditRecipe] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecipes, setAiRecipes] = useState([]);
  const [aiError, setAiError] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeSearchResult, setRecipeSearchResult] = useState(null);
  const [recipeSearchLoading, setRecipeSearchLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [showScanConfirm, setShowScanConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", qty: "", unit: "kg", cat: "verduras" });

  function update(patch) {
    setData((prev) => {
      const next = { ...prev, ...patch };
      saveData(next);
      return next;
    });
  }

  function adjustQty(id, delta) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, round(item.qty + delta));
    const newItems = items.map((i) => (i.id === id ? { ...i, qty: newQty } : i));
    const newLogs = delta < 0
      ? [{ id: Date.now(), emoji: CAT_EMOJI[item.cat], name: item.name, qty: `${delta} ${item.unit}`, time: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }) }, ...logs.slice(0, 29)]
      : logs;
    update({ items: newItems, logs: newLogs });
  }

  function openAdd() { setForm({ name: "", qty: "", unit: "kg", cat: "verduras" }); setEditItem(null); setShowAdd(true); }
  function openEdit(item) { setForm({ name: item.name, qty: String(item.qty), unit: item.unit, cat: item.cat }); setEditItem(item); setShowAdd(true); }

  function saveItem() {
    if (!form.name.trim() || !form.qty) return;
    const qty = parseFloat(form.qty);
    if (isNaN(qty)) return;
    let newItems;
    if (editItem) {
      newItems = items.map((i) => i.id === editItem.id ? { ...i, name: form.name.trim(), qty, unit: form.unit, cat: form.cat } : i);
    } else {
      const existing = items.find((i) => i.name.toLowerCase() === form.name.trim().toLowerCase());
      if (existing) {
        newItems = items.map((i) => i.id === existing.id ? { ...i, qty: round(i.qty + qty) } : i);
      } else {
        newItems = [...items, { id: Date.now(), name: form.name.trim(), qty, unit: form.unit, cat: form.cat, max: qty * 3 || 3 }];
      }
    }
    update({ items: newItems });
    setShowAdd(false);
  }

  function deleteItem(id) { update({ items: items.filter((i) => i.id !== id) }); }

  async function scanImage(file) {
    setScanLoading(true);
    setScanResults(null);
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = () => rej(new Error("Error leyendo imagen"));
        reader.readAsDataURL(file);
      });
      const mediaType = file.type || "image/jpeg";
      const text = await callClaudeWithImage(base64, mediaType);
      const match = text.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(match ? match[0] : text);
      setScanResults(parsed.map(item => ({ ...item, selected: true, max: (item.qty || 1) * 3 })));
      setShowScanConfirm(true);
    } catch {
      alert("No se pudo analizar la imagen. Intenta de nuevo.");
    }
    setScanLoading(false);
  }

  function confirmScan() {
    const selected = scanResults.filter(i => i.selected);
    let newItems = [...items];
    selected.forEach(scanned => {
      const existing = newItems.find(i => i.name.toLowerCase() === scanned.name.toLowerCase());
      if (existing) {
        newItems = newItems.map(i => i.id === existing.id ? { ...i, qty: round(i.qty + (scanned.qty || 1)) } : i);
      } else {
        newItems.push({ id: Date.now() + Math.random(), name: scanned.name, qty: scanned.qty || 1, unit: scanned.unit || "unidades", cat: scanned.cat || "abarrotes", max: scanned.max || 3 });
      }
    });
    update({ items: newItems });
    setShowScanConfirm(false);
    setScanResults(null);
  }

  async function generateRecipes() {
    setAiLoading(true);
    setAiError("");
    setAiRecipes([]);
    const inStock = items.filter((i) => i.qty > 0).map((i) => `${i.name} (${i.qty} ${i.unit})`).join(", ");
    const outOfStock = items.filter((i) => i.qty <= 0).map((i) => i.name).join(", ");
    const systemPrompt = `Eres un chef peruano experto en cocina casera. Responde SOLO con JSON válido, sin texto adicional, sin markdown, sin backticks. Estructura exacta del array: [{"title":"nombre","description":"descripción en 1 oración","time":"X min","missing":["ingrediente faltante con cantidad"],"ingredients":["cantidad + ingrediente"],"steps":["Paso 1"]}]. REGLAS: En missing solo ingredientes ESENCIALES que NO están en stock. Sal, pimienta y agua no cuentan. Si tiene todo, missing=[].`;
    const prompt = `MI STOCK: ${inStock}.${outOfStock ? ` AGOTADOS: ${outOfStock}.` : ""} Genera 8 recetas peruanas o latinoamericanas caseras. Primero 3 que puedo hacer YA (missing=[]), luego 5 donde me faltan 1-3 ingredientes.`;
    try {
      const text = await callClaude(prompt, systemPrompt);
      const match = text.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(match ? match[0] : text);
      setAiRecipes(parsed);
    } catch {
      setAiError("No se pudo generar recetas. Revisa tu conexión.");
    }
    setAiLoading(false);
  }

  async function searchRecipe() {
    if (!recipeSearch.trim()) return;
    setRecipeSearchLoading(true);
    setRecipeSearchResult(null);
    const inStock = items.filter((i) => i.qty > 0).map((i) => `${i.name} (${i.qty} ${i.unit})`).join(", ");
    const systemPrompt = `Eres un chef peruano experto. Responde SOLO con JSON válido, sin texto, sin markdown, sin backticks. Estructura: {"title":"nombre","description":"descripción","time":"X min","canMake":true/false,"have":["ingrediente que ya tiene"],"missing":["ingrediente faltante con cantidad"],"ingredients":["cantidad + ingrediente"],"steps":["paso detallado"]}`;
    const prompt = `MI STOCK: ${inStock}. El usuario quiere cocinar: "${recipeSearch.trim()}". Analiza si puede hacerlo. En "have" los ingredientes que ya tiene. En "missing" los esenciales que le faltan con cantidades. Genera la receta completa.`;
    try {
      const text = await callClaude(prompt, systemPrompt);
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : text);
      setRecipeSearchResult(parsed);
    } catch {
      setRecipeSearchResult({ error: true });
    }
    setRecipeSearchLoading(false);
  }

  function saveRecipe(recipe) {
    if (recipes.some((r) => r.title === recipe.title)) return;
    update({ recipes: [...recipes, { ...recipe, id: Date.now() }] });
  }

  function deleteRecipe(id) { update({ recipes: recipes.filter((r) => r.id !== id) }); }

  function saveEditedRecipe(edited) {
    update({ recipes: recipes.map((r) => (r.id === edited.id ? edited : r)) });
    setEditRecipe(null);
    setViewRecipe(edited);
  }

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return (activeCat === "all" || i.cat === activeCat) && i.name.toLowerCase().includes(q);
  });

  const total = items.length;
  const okCount = items.filter((i) => getStatus(i) === "ok").length;
  const lowCount = items.filter((i) => getStatus(i) === "low").length;
  const emptyCount = items.filter((i) => getStatus(i) === "empty").length;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#f8f7f4", minHeight: "100vh", paddingBottom: 80 }}>

      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18, color: "#111827" }}>
            <span style={{ fontSize: 22 }}>🫙</span> Despensa
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── STOCK ── */}
        {tab === "stock" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 18 }}>
              {[
                { num: total, label: "total", color: "#111827" },
                { num: okCount, label: "ok", color: "#16a34a" },
                { num: lowCount, label: "bajo", color: "#d97706" },
                { num: emptyCount, label: "agotado", color: "#dc2626" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "12px 8px", textAlign: "center", border: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}><Icon name="search" size={16} /></span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ingrediente..." style={{ ...inputStyle, paddingLeft: 36 }} />
              </div>
              <label style={{ ...btnGhost, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", padding: "0 14px", cursor: "pointer", opacity: scanLoading ? 0.7 : 1 }}>
                {scanLoading ? "..." : <><Icon name="camera" size={16} /><span>Foto</span></>}
                <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                  onChange={(e) => e.target.files[0] && scanImage(e.target.files[0])} disabled={scanLoading} />
              </label>
              <button onClick={openAdd} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", padding: "0 16px" }}>
                <Icon name="plus" size={16} color="#fff" /> Agregar
              </button>
            </div>

            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
              {CATS.map((c) => (
                <button key={c.id} onClick={() => setActiveCat(c.id)}
                  style={{ borderRadius: 99, padding: "7px 14px", fontSize: 13, border: "1.5px solid", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, background: activeCat === c.id ? "#111827" : "#fff", color: activeCat === c.id ? "#fff" : "#374151", borderColor: activeCat === c.id ? "#111827" : "#e5e7eb", fontWeight: activeCat === c.id ? 600 : 400 }}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "#9ca3af" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: 14 }}>No se encontraron ingredientes</div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} onAdjust={adjustQty} onEdit={openEdit} onDelete={deleteItem} />
              ))}
            </div>
          </div>
        )}

        {/* ── RECETAS ── */}
        {tab === "recetas" && (
          <div>
            {/* Buscador específico */}
            <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 10 }}>¿Qué quieres cocinar?</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={recipeSearch} onChange={(e) => setRecipeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchRecipe()}
                  placeholder="ej. Lomo saltado..."
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={searchRecipe} disabled={recipeSearchLoading}
                  style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", opacity: recipeSearchLoading ? 0.7 : 1, padding: "0 14px" }}>
                  <Icon name="search" size={15} color="#fff" />
                  {recipeSearchLoading ? "..." : "Buscar"}
                </button>
              </div>
              {recipeSearchResult && !recipeSearchResult.error && (
                <div style={{ marginTop: 14, borderTop: "1px solid #f3f4f6", paddingTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{recipeSearchResult.title}</div>
                    {recipeSearchResult.canMake
                      ? <Badge color="green"><Icon name="check" size={12} />Puedes hacerlo</Badge>
                      : <Badge color="amber"><Icon name="alert" size={12} />Te falta algo</Badge>}
                  </div>
                  {recipeSearchResult.have?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", marginBottom: 6 }}>✅ Ya tienes:</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {recipeSearchResult.have.map((h) => (
                          <span key={h} style={{ fontSize: 12, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 9px" }}>{h}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {recipeSearchResult.missing?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#d97706", marginBottom: 6 }}>🛒 Necesitas comprar:</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {recipeSearchResult.missing.map((m) => (
                          <span key={m} style={{ fontSize: 12, background: "#fef3c7", color: "#92400e", borderRadius: 6, padding: "3px 9px" }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setViewRecipe(recipeSearchResult)}
                    style={{ ...btnGhost, fontSize: 13, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="book" size={14} /> Ver receta completa
                  </button>
                </div>
              )}
              {recipeSearchResult?.error && (
                <div style={{ marginTop: 10, fontSize: 13, color: "#dc2626" }}>No se pudo consultar. Intenta de nuevo.</div>
              )}
            </div>

            {/* Generador */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Sugerencias de la IA</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Según lo que tienes en stock</div>
              </div>
              <button onClick={generateRecipes} disabled={aiLoading}
                style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6, opacity: aiLoading ? 0.7 : 1 }}>
                <Icon name="sparkles" size={14} color="#fff" />
                {aiLoading ? "..." : "Generar"}
              </button>
            </div>

            {aiError && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "12px 14px", fontSize: 13, marginBottom: 16 }}>{aiError}</div>}

            {aiLoading && (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "#6b7280" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍🍳</div>
                <div style={{ fontSize: 14 }}>Analizando tu despensa...</div>
              </div>
            )}

            {!aiLoading && aiRecipes.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af", border: "1.5px dashed #e5e7eb", borderRadius: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✨</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Presiona "Generar"</div>
                <div style={{ fontSize: 13 }}>La IA usará tu stock actual</div>
              </div>
            )}

            {aiRecipes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {aiRecipes.map((r, i) => (
                  <RecipeCard key={i} recipe={r} onView={setViewRecipe} showDelete={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MIS RECETAS ── */}
        {tab === "mias" && (
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Mis recetas</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Guardadas y editadas a tu gusto</div>
            {recipes.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af", border: "1.5px dashed #e5e7eb", borderRadius: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>⭐</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Sin recetas guardadas</div>
                <div style={{ fontSize: 13 }}>Genera recetas con IA y guarda tus favoritas</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recipes.map((r) => (
                <RecipeCard key={r.id} recipe={r} onView={setViewRecipe} showDelete={true} onDelete={deleteRecipe} />
              ))}
            </div>
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab === "historial" && (
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Historial de uso</div>
            {logs.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "#9ca3af" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 14 }}>Aún no hay registros.</div>
              </div>
            )}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
              {logs.map((l, i) => (
                <div key={l.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < logs.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <span style={{ fontSize: 24, width: 32 }}>{l.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{l.time}</div>
                  </div>
                  <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>{l.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e5e7eb", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0 8px", border: "none", background: "none", cursor: "pointer", color: tab === t.id ? "#111827" : "#9ca3af" }}>
            <Icon name={t.icon} size={22} color={tab === t.id ? "#111827" : "#9ca3af"} />
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── MODAL AGREGAR/EDITAR ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editItem ? "Editar ingrediente" : "Agregar ingrediente"}>
        <Field label="Nombre">
          <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="ej. Papa amarilla" />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Cantidad">
            <input style={inputStyle} type="number" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} placeholder="0" min="0" step="0.5" />
          </Field>
          <Field label="Unidad">
            <select style={inputStyle} value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Categoría">
          <select style={inputStyle} value={form.cat} onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))}>
            {CATS.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btnGhost} onClick={() => setShowAdd(false)}>Cancelar</button>
          <button style={btnPrimary} onClick={saveItem}>{editItem ? "Guardar cambios" : "Agregar"}</button>
        </div>
      </Modal>

      {/* ── SHEET VER RECETA ── */}
      <BottomSheet open={!!viewRecipe && !editRecipe} onClose={() => setViewRecipe(null)} title={viewRecipe?.title || ""}>
        {viewRecipe && (
          <>
            {viewRecipe.time && (
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <Icon name="clock" size={13} />{viewRecipe.time}
              </div>
            )}
            {viewRecipe.description && <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16, lineHeight: 1.6 }}>{viewRecipe.description}</p>}

            {viewRecipe.have?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", marginBottom: 8 }}>✅ Ya tienes:</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {viewRecipe.have.map((h) => <span key={h} style={{ fontSize: 13, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 10px" }}>{h}</span>)}
                </div>
              </div>
            )}

            {viewRecipe.missing?.length > 0 && (
              <div style={{ background: "#fef3c7", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>🛒 Necesitas comprar:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {viewRecipe.missing.map((m) => <span key={m} style={{ fontSize: 13, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, padding: "3px 10px", color: "#78350f" }}>{m}</span>)}
                </div>
              </div>
            )}

            {viewRecipe.ingredients?.length > 0 && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Ingredientes</div>
                <div style={{ marginBottom: 18 }}>
                  {viewRecipe.ingredients.map((ing, i) => (
                    <div key={i} style={{ fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#d1d5db", flexShrink: 0 }} />{ing}
                    </div>
                  ))}
                </div>
              </>
            )}

            {viewRecipe.steps?.length > 0 && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Preparación</div>
                <div style={{ marginBottom: 20 }}>
                  {viewRecipe.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 12 }}>
                      <span style={{ minWidth: 26, height: 26, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              {!recipes.some((r) => r.title === viewRecipe.title) ? (
                <button onClick={() => saveRecipe(viewRecipe)} style={{ ...btnPrimary, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Icon name="star" size={15} color="#fff" /> Guardar receta
                </button>
              ) : (
                <button onClick={() => { const saved = recipes.find((r) => r.title === viewRecipe.title); setEditRecipe({ ...saved }); }}
                  style={{ ...btnGhost, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Icon name="edit" size={15} /> Editar receta
                </button>
              )}
            </div>
          </>
        )}
      </BottomSheet>

      {/* ── SHEET EDITAR RECETA ── */}
      <BottomSheet open={!!editRecipe} onClose={() => setEditRecipe(null)} title="Editar receta">
        {editRecipe && (
          <>
            <Field label="Título">
              <input style={inputStyle} value={editRecipe.title} onChange={(e) => setEditRecipe((r) => ({ ...r, title: e.target.value }))} />
            </Field>
            <Field label="Descripción">
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={editRecipe.description || ""} onChange={(e) => setEditRecipe((r) => ({ ...r, description: e.target.value }))} />
            </Field>
            <Field label="Ingredientes (uno por línea)">
              <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={(editRecipe.ingredients || []).join("\n")} onChange={(e) => setEditRecipe((r) => ({ ...r, ingredients: e.target.value.split("\n") }))} />
            </Field>
            <Field label="Pasos de preparación (uno por línea)">
              <textarea style={{ ...inputStyle, minHeight: 130, resize: "vertical" }} value={(editRecipe.steps || []).join("\n")} onChange={(e) => setEditRecipe((r) => ({ ...r, steps: e.target.value.split("\n").filter(Boolean) }))} />
            </Field>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button style={btnGhost} onClick={() => setEditRecipe(null)}>Cancelar</button>
              <button style={btnPrimary} onClick={() => saveEditedRecipe(editRecipe)}>Guardar cambios</button>
            </div>
          </>
        )}
      </BottomSheet>

      {/* ── SHEET CONFIRMAR ESCANEO ── */}
      <BottomSheet open={showScanConfirm} onClose={() => setShowScanConfirm(false)} title="Ingredientes detectados">
        {scanResults && (
          <>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>Selecciona los que quieres agregar a tu stock:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {scanResults.map((item, i) => (
                <div key={i} onClick={() => setScanResults(prev => prev.map((r, j) => j === i ? { ...r, selected: !r.selected } : r))}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${item.selected ? "#111827" : "#e5e7eb"}`, background: item.selected ? "#f9fafb" : "#fff", cursor: "pointer" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.selected ? "#111827" : "#d1d5db"}`, background: item.selected ? "#111827" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.selected && <Icon name="check" size={13} color="#fff" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{item.qty} {item.unit} · {CAT_EMOJI[item.cat]} {item.cat}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btnGhost} onClick={() => setShowScanConfirm(false)}>Cancelar</button>
              <button style={{ ...btnPrimary, flex: 1 }} onClick={confirmScan}>
                Agregar {scanResults.filter(i => i.selected).length} ingredientes
              </button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
