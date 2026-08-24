export const TOKEN_KEYS = ['bg','surface','primary','primaryDark','accent','title','body','muted','success','warning','danger'];

const T = (id, name, dark, tokens, default_ = false) => ({ id, name, dark, tokens, default: default_ });

export const THEMES = [
  T('aurora-light', '极光蓝紫', false, { bg:'#f4f6ff', surface:'#ffffff', primary:'#4f7cff', primaryDark:'#3b63d9', accent:'#22d3ee', title:'#1e2a5a', body:'#5a6a94', muted:'#8a94a6', success:'#10b981', warning:'#f59e0b', danger:'#e5484d' }, true),
  T('teal-bio', '生物青绿', false, { bg:'#effbf6', surface:'#ffffff', primary:'#14b8a6', primaryDark:'#0d9488', accent:'#fbbf24', title:'#0f3d33', body:'#4d7268', muted:'#6b8f85', success:'#10b981', warning:'#f59e0b', danger:'#e5484d' }),
  T('deep-neon', '深空霓虹', true, { bg:'#131a3d', surface:'#1c2454', primary:'#3f7dff', primaryDark:'#2f5fc4', accent:'#67e8f9', title:'#f2f6ff', body:'#9fb0dd', muted:'#7688b8', success:'#34d399', warning:'#fbbf24', danger:'#f87171' }),
  T('blue-orange', '经典蓝橙', false, { bg:'#f8fafc', surface:'#ffffff', primary:'#2563eb', primaryDark:'#1d4ed8', accent:'#f97316', title:'#16233f', body:'#5c6b85', muted:'#94a1b8', success:'#10b981', warning:'#f59e0b', danger:'#ef4444' }),
  T('rose', '樱花粉', false, { bg:'#fff5f8', surface:'#ffffff', primary:'#db2777', primaryDark:'#be185d', accent:'#fb7185', title:'#4c1136', body:'#96687d', muted:'#c295a8', success:'#10b981', warning:'#f59e0b', danger:'#e5484d' }),
  T('sunset', '落日橙粉', false, { bg:'#f97316', surface:'#ffffff', primary:'#ffffff', primaryDark:'#ffe1d1', accent:'#db2777', title:'#ffffff', body:'#ffe1d1', muted:'#ffc9b0', success:'#10b981', warning:'#fbbf24', danger:'#e5484d' }),
  T('grape', '葡萄紫', false, { bg:'#faf7ff', surface:'#ffffff', primary:'#7c3aed', primaryDark:'#6d28d9', accent:'#c084fc', title:'#2e1065', body:'#6d5f92', muted:'#a99cc7', success:'#10b981', warning:'#f59e0b', danger:'#e5484d' }),
  T('lime', '柠檬苏打', false, { bg:'#fdfceb', surface:'#ffffff', primary:'#65a30d', primaryDark:'#4d7c0f', accent:'#facc15', title:'#1f2a10', body:'#6b754a', muted:'#98a06f', success:'#16a34a', warning:'#f59e0b', danger:'#dc2626' }),
  T('forest', '森林墨绿', true, { bg:'#10291b', surface:'#173a26', primary:'#22c55e', primaryDark:'#16a34a', accent:'#86efac', title:'#eafff2', body:'#93b8a2', muted:'#6b8f7a', success:'#22c55e', warning:'#fbbf24', danger:'#f87171' }),
  T('graphite-gold', '石墨鎏金', true, { bg:'#191a1f', surface:'#26272e', primary:'#eab308', primaryDark:'#ca8a04', accent:'#fbbf24', title:'#f5f2ea', body:'#9b978c', muted:'#6e6a60', success:'#10b981', warning:'#fbbf24', danger:'#f87171' }),
  T('ocean', '海洋蓝青', false, { bg:'#edfbfe', surface:'#ffffff', primary:'#0891b2', primaryDark:'#0e7490', accent:'#22d3ee', title:'#083344', body:'#4b7484', muted:'#7ba3b3', success:'#10b981', warning:'#f59e0b', danger:'#e5484d' }),
  T('mono', '极简黑白', false, { bg:'#ffffff', surface:'#ffffff', primary:'#111111', primaryDark:'#000000', accent:'#555555', title:'#111111', body:'#44444a', muted:'#77777d', success:'#10b981', warning:'#f59e0b', danger:'#e5484d' }),
];

export const LAYOUTS = [
  { id:'left-right', name:'左文右标' },
  { id:'centered', name:'居中对称' },
  { id:'feature-grid', name:'标题+特性格' },
  { id:'diagonal', name:'斜切动势' },
];

export const MIXES = [
  { id:'solid', name:'纯色底' },
  { id:'aurora', name:'极光渐变网' },
  { id:'band', name:'渐变色带' },
  { id:'multichip', name:'多彩功能位' },
];
