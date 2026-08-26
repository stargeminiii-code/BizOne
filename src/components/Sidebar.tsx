import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, ShoppingCart, Users, Calculator, Boxes, Megaphone, Settings, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { ViewMode, UserAccount } from '../types';
import { APP_NAME } from '../constants/appConfig';
import { useLanguage } from '../i18n';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  lowStockCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  currentUser?: UserAccount;
  onLogout?: () => void;
}

type Item = { id: string; label: string; view: ViewMode };
type Workspace = { id: string; label: string; icon: React.ElementType; view: ViewMode; children?: Item[] };

const accentColor = () => {
  if (typeof window === 'undefined') return '#0f172a';
  const css = getComputedStyle(document.documentElement).getPropertyValue('--bizone-accent').trim();
  if (css) return css;
  const saved = localStorage.getItem('bizone_accent_color') || localStorage.getItem('accentColor') || '';
  const presets: Record<string,string> = { blue:'#2563eb', indigo:'#4f46e5', emerald:'#059669', violet:'#7c3aed', rose:'#e11d48', amber:'#d97706', slate:'#0f172a' };
  return saved.startsWith('#') ? saved : (presets[saved.toLowerCase()] || '#0f172a');
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, isOpen=false, onClose, currentUser, onLogout }) => {
  const { language } = useLanguage();
  const [compact, setCompact] = useState(() => localStorage.getItem('bizone_sidebar_compact') === 'true');
  const [open, setOpen] = useState<string | null>(null);
  const [accent, setAccent] = useState(accentColor);

  useEffect(() => { localStorage.setItem('bizone_sidebar_compact', String(compact)); }, [compact]);
  useEffect(() => {
    const refresh = () => setAccent(accentColor());
    window.addEventListener('storage', refresh);
    window.addEventListener('bizone-accent-change', refresh as EventListener);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('bizone-accent-change', refresh as EventListener);
    };
  }, []);

  const ws = useMemo<Workspace[]>(() => [
    { id:'sales', label:language==='vi'?'Bán hàng':'Sales', icon:ShoppingCart, view:'orders', children:[
      {id:'orders', label:language==='vi'?'Đơn hàng':'Orders', view:'orders'}
    ]},
    { id:'crm', label:language==='vi'?'CRM & Khách hàng':'CRM & Customers', icon:Users, view:'crm' },
    { id:'finance', label:language==='vi'?'Tài chính & Kế toán':'Finance & Accounting', icon:Calculator, view:'cashflow', children:[
      {id:'cashflow', label:language==='vi'?'Dòng tiền':'Cash flow', view:'cashflow'},
      {id:'pnl', label:language==='vi'?'Lãi lỗ':'P&L', view:'pnl'},
      {id:'banking', label:language==='vi'?'Tài khoản thanh toán':'Banking', view:'banking'}
    ]},
    { id:'ccu', label:'CCU', icon:Boxes, view:'inventory', children:[
      {id:'inventory', label:language==='vi'?'Kho & FIFO':'Inventory & FIFO', view:'inventory'},
      {id:'products', label:language==='vi'?'Sản phẩm & SKU':'Products & SKU', view:'variant-definitions'},
      {id:'purchasing', label:language==='vi'?'Mua hàng':'Purchasing', view:'purchasing'},
      {id:'suppliers', label:language==='vi'?'Nhà cung cấp':'Suppliers', view:'suppliers'},
      {id:'recipes', label:language==='vi'?'Công thức & BOM':'Recipes & BOM', view:'beverages'},
      {id:'fifo', label:language==='vi'?'Lô FIFO':'FIFO lots', view:'warehouse-fifo-lots'}
    ]},
    { id:'marketing', label:language==='vi'?'Marketing':'Marketing', icon:Megaphone, view:'marketing' }
  ], [language]);

  const active = (w: Workspace) => w.view===currentView || !!w.children?.some(x=>x.view===currentView);
  const nav = (view: ViewMode, id?: string) => { onSelectView(view); if(id) setOpen(id); onClose?.(); };
  const base = 'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors';

  return <>
    {isOpen && <div onClick={onClose} className="fixed inset-0 z-40 bg-slate-900/30 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col h-full transition-all duration-200 md:static md:translate-x-0 md:sticky md:top-0 md:z-30 ${isOpen?'translate-x-0 w-72':'-translate-x-full md:shadow-none'} ${compact?'md:w-20':'md:w-64'}`}>
      <div className="h-14 px-3 border-b border-slate-200 flex items-center justify-between shrink-0">
        <button onClick={()=>nav('dashboard')} className={`flex items-center gap-2.5 min-w-0 ${compact?'md:w-full md:justify-center':''}`} title={APP_NAME}>
          <span className="w-8 h-8 rounded-md text-white flex items-center justify-center font-bold shrink-0" style={{backgroundColor:accent}}>B</span>
          {!compact && <span className="min-w-0 text-left"><span className="block text-sm font-semibold text-slate-900 truncate">{APP_NAME}</span><span className="block text-[10px] text-slate-400">Enterprise System</span></span>}
        </button>
        <button onClick={()=>setCompact(x=>!x)} className="hidden md:inline-flex p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-50" title={compact?'Expand':'Collapse'}>{compact?<PanelLeftOpen className="w-4 h-4"/>:<PanelLeftClose className="w-4 h-4"/>}</button>
        <button onClick={onClose} className="md:hidden p-1.5 text-slate-400"><X className="w-4 h-4"/></button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <button onClick={()=>nav('dashboard')} className={`${base} ${currentView==='dashboard'?'text-white font-semibold':'text-slate-700 hover:bg-slate-50'}`} style={currentView==='dashboard'?{backgroundColor:accent}:undefined}>
          <LayoutDashboard className="w-4 h-4" strokeWidth={1.8}/>{!compact&&<span>Dashboard</span>}
        </button>

        {ws.map(w=>{ 
          const isActive=active(w); 
          const expanded=open===w.id||isActive; 
          const Icon=w.icon;
          return <div key={w.id}>
            <div className="flex items-center gap-1">
              <button onClick={()=>nav(w.view,w.id)} className={`${base} flex-1 ${isActive?'text-white font-semibold':'text-slate-700 hover:bg-slate-50'}`} style={isActive?{backgroundColor:accent}:undefined} title={w.label}>
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8}/>{!compact&&<span className="truncate">{w.label}</span>}
              </button>
              {!compact&&w.children&&<button onClick={()=>setOpen(x=>x===w.id?null:w.id)} className="p-1.5 text-slate-400 hover:text-slate-700" aria-label={expanded?'Thu gọn':'Mở rộng'}>
                <ChevronDown className={`w-3.5 h-3.5 ${expanded?'rotate-180':''}`}/>
              </button>}
            </div>
            {!compact&&w.children&&expanded&&
              <div className="ml-7 mt-0.5 border-l border-slate-200 pl-2 space-y-0.5">
                {w.children.map(c=>
                  <button key={c.id} onClick={()=>nav(c.view,w.id)} className={`w-full px-2.5 py-1.5 rounded text-xs text-left ${currentView===c.view?'font-semibold text-slate-900 bg-slate-50':'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                    {c.label}
                  </button>
                )}
              </div>
            }
          </div>
        })}
      </nav>

      <div className="border-t border-slate-200 p-2 space-y-1 shrink-0">
        <button onClick={()=>nav('settings')} className={`${base} ${currentView==='settings'?'text-white font-semibold':'text-slate-500 hover:bg-slate-50'}`} style={currentView==='settings'?{backgroundColor:accent}:undefined}>
          <Settings className="w-4 h-4" strokeWidth={1.8}/>{!compact&&<span>{language==='vi'?'Cài đặt':'Settings'}</span>}
        </button>
        {currentUser&&!compact&&<div className="px-3 py-2 border-t border-slate-100 text-xs"><div className="font-medium text-slate-800 truncate">{currentUser.name}</div><div className="text-[10px] text-slate-400 truncate">{currentUser.role}</div></div>}
        {onLogout&&<button onClick={onLogout} className={`${base} text-slate-500 hover:text-red-600 hover:bg-slate-50`}><LogOut className="w-4 h-4" strokeWidth={1.8}/>{!compact&&<span>{language==='vi'?'Đăng xuất':'Log out'}</span>}</button>}
      </div>
    </aside>
  </>;
};
