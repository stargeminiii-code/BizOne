import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Network,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Sparkles,
  Layers,
  FileText,
  ArrowRight,
  TrendingUp,
  Target,
  ExternalLink,
  Edit,
  Plus,
  CheckCircle2,
  X,
  Sliders,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { KeywordNode, KeywordEdge, KeywordNodeType, GenSeoArticle } from '../../types';

interface KeywordGraphViewProps {
  nodes: KeywordNode[];
  edges: KeywordEdge[];
  articles: GenSeoArticle[];
  onSelectKeyword?: (node: KeywordNode) => void;
  onOpenCreateArticle?: (node: KeywordNode) => void;
  onOpenEditKeyword?: (node: KeywordNode) => void;
}

export const KeywordGraphView: React.FC<KeywordGraphViewProps> = ({
  nodes,
  edges,
  articles,
  onSelectKeyword,
  onOpenCreateArticle,
  onOpenEditKeyword
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | KeywordNodeType>('all');
  const [selectedNode, setSelectedNode] = useState<KeywordNode | null>(nodes[0] || null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Position nodes radially / hierarchically centered around Pillars
  const positionedNodes = useMemo(() => {
    const pillars = nodes.filter((n) => n.type === 'pillar');
    const width = 1000;
    const height = 650;
    const centerX = width / 2;
    const centerY = height / 2;

    const result: (KeywordNode & { px: number; py: number; radius: number; color: string; labelOffset: { x: number; y: number } })[] = [];

    // 1. Position Pillars in a ring around center
    pillars.forEach((pillar, pIdx) => {
      const pAngle = (pIdx / Math.max(pillars.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const pDist = 140;
      const px = centerX + Math.cos(pAngle) * pDist;
      const py = centerY + Math.sin(pAngle) * pDist;

      result.push({
        ...pillar,
        px,
        py,
        radius: 28,
        color: '#6366f1', // Indigo
        labelOffset: { x: 0, y: py > centerY ? 36 : -36 }
      });

      // 2. Position Clusters around their respective Pillar
      const clusters = nodes.filter((n) => n.parentId === pillar.id && n.type === 'cluster');
      clusters.forEach((cluster, cIdx) => {
        const spread = Math.PI * 0.7;
        const cAngle = pAngle - spread / 2 + (cIdx / Math.max(clusters.length - 1, 1)) * spread;
        const cDist = 130;
        const cx = px + Math.cos(cAngle) * cDist;
        const cy = py + Math.sin(cAngle) * cDist;

        result.push({
          ...cluster,
          px: cx,
          py: cy,
          radius: 20,
          color: '#3b82f6', // Blue
          labelOffset: { x: cx > centerX ? 24 : -24, y: cy > centerY ? 24 : -24 }
        });

        // 3. Position Articles around their respective Cluster
        const arts = nodes.filter((n) => n.parentId === cluster.id && n.type === 'article');
        arts.forEach((art, aIdx) => {
          const aSpread = Math.PI * 0.6;
          const aAngle = cAngle - aSpread / 2 + (aIdx / Math.max(arts.length - 1, 1)) * aSpread;
          const aDist = 100;
          const ax = cx + Math.cos(aAngle) * aDist;
          const ay = cy + Math.sin(aAngle) * aDist;

          result.push({
            ...art,
            px: ax,
            py: ay,
            radius: 15,
            color: '#10b981', // Emerald
            labelOffset: { x: ax > centerX ? 18 : -18, y: 16 }
          });

          // 4. Position Variants around their respective Article
          const variants = nodes.filter((n) => n.parentId === art.id && n.type === 'variant');
          variants.forEach((v, vIdx) => {
            const vAngle = aAngle + (vIdx - 0.5) * 0.5;
            const vDist = 65;
            const vx = ax + Math.cos(vAngle) * vDist;
            const vy = ay + Math.sin(vAngle) * vDist;

            result.push({
              ...v,
              px: vx,
              py: vy,
              radius: 10,
              color: '#f59e0b', // Amber
              labelOffset: { x: vx > centerX ? 12 : -12, y: 12 }
            });
          });
        });
      });
    });

    return result;
  }, [nodes]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return positionedNodes.filter((n) => {
      const matchSearch =
        n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.suggestedArticleTitle && n.suggestedArticleTitle.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = selectedTypeFilter === 'all' || n.type === selectedTypeFilter;
      return matchSearch && matchType;
    });
  }, [positionedNodes, searchTerm, selectedTypeFilter]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  // Connected edges and highlight set
  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const set = new Set<string>([selectedNode.id]);
    edges.forEach((e) => {
      if (e.source === selectedNode.id) set.add(e.target);
      if (e.target === selectedNode.id) set.add(e.source);
    });
    return set;
  }, [selectedNode, edges]);

  // Zoom and Pan Handlers
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 2.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Associated article for selected node
  const linkedArticle = useMemo(() => {
    if (!selectedNode) return null;
    return articles.find((a) => a.keywordId === selectedNode.id || a.id === selectedNode.articleId);
  }, [selectedNode, articles]);

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filters & Search */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm từ khóa trong đồ thị quan hệ..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition ${selectedTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('pillar')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${selectedTypeFilter === 'pillar' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-indigo-700'}`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Pillar (Trụ cột)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('cluster')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${selectedTypeFilter === 'cluster' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-blue-700'}`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Cluster (Cụm)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('article')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${selectedTypeFilter === 'article' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-emerald-700'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Article (Bài viết)
            </button>
          </div>
        </div>

        {/* Right: Graph Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              showLabels ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Nhãn ({showLabels ? 'Bật' : 'Tắt'})</span>
          </button>

          <button
            type="button"
            onClick={() => handleZoom(0.15)}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
            title="Phóng to đồ thị"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.15)}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
            title="Thu nhỏ đồ thị"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
            title="Khôi phục góc nhìn gốc (Fit Screen)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Detail Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Canvas Visualizer */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative min-h-[580px] h-[620px] select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Graph Legend Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5 shadow-lg">
            <div className="font-extrabold text-white text-xs mb-1 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cấu Trúc Keyword Graph</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30"></span>
              <span>Pillar (Trụ cột chủ đề lớn)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500/30"></span>
              <span>Cluster (Cụm từ khóa phụ)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></span>
              <span>Article (Bài viết chính)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30"></span>
              <span>Variant / LSI Keyword</span>
            </div>
          </div>

          {/* SVG Render Layer */}
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 650"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: '500px 325px',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
              </pattern>
              <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <rect width="1000" height="650" fill="url(#graph-grid)" />

            {/* Edges Lines */}
            <g className="edges">
              {edges.map((edge) => {
                const srcNode = positionedNodes.find((n) => n.id === edge.source);
                const tgtNode = positionedNodes.find((n) => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;

                const isConnected =
                  selectedNode &&
                  (connectedNodeIds.has(srcNode.id) && connectedNodeIds.has(tgtNode.id));

                const isInternalLink = edge.relationType === 'internal_link';

                return (
                  <line
                    key={edge.id}
                    x1={srcNode.px}
                    y1={srcNode.py}
                    x2={tgtNode.px}
                    y2={tgtNode.py}
                    stroke={isConnected ? '#38bdf8' : isInternalLink ? '#f43f5e' : '#334155'}
                    strokeWidth={isConnected ? 2.5 : isInternalLink ? 1.5 : 1}
                    strokeDasharray={isInternalLink ? '4 3' : 'none'}
                    strokeOpacity={isConnected ? 0.9 : 0.4}
                  />
                );
              })}
            </g>

            {/* Nodes Render */}
            <g className="nodes">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isConnected = selectedNode && connectedNodeIds.has(node.id);

                return (
                  <g
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                      onSelectKeyword?.(node);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for selected node */}
                    {isSelected && (
                      <circle
                        cx={node.px}
                        cy={node.py}
                        r={node.radius + 8}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ transformOrigin: `${node.px}px ${node.py}px` }}
                      />
                    )}

                    {/* Node Circle */}
                    <circle
                      cx={node.px}
                      cy={node.py}
                      r={node.radius}
                      fill={node.color}
                      stroke={isSelected ? '#ffffff' : isConnected ? '#38bdf8' : '#0f172a'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-transform duration-200 group-hover:scale-125"
                      style={{ transformOrigin: `${node.px}px ${node.py}px` }}
                    />

                    {/* Node Internal Volume/Rank Badge */}
                    {node.type !== 'variant' && (
                      <text
                        x={node.px}
                        y={node.py + 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={node.type === 'pillar' ? '11px' : '9px'}
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {node.ranking ? `#${node.ranking}` : `${Math.round(node.searchVolume / 1000)}k`}
                      </text>
                    )}

                    {/* Label with Collision Offset */}
                    {showLabels && (
                      <g transform={`translate(${node.px + node.labelOffset.x}, ${node.py + node.labelOffset.y})`}>
                        <rect
                          x={-Math.min(node.label.length * 3.6, 75)}
                          y={-10}
                          width={Math.min(node.label.length * 7.2, 150)}
                          height={18}
                          rx={5}
                          fill="#0f172a"
                          fillOpacity="0.85"
                          stroke={isSelected ? '#38bdf8' : '#1e293b'}
                          strokeWidth="1"
                        />
                        <text
                          x={0}
                          y={3}
                          textAnchor="middle"
                          fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                          fontSize="9.5px"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          pointerEvents="none"
                        >
                          {node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right-Side Detail Panel (Drawer) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between space-y-4">
          {selectedNode ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        selectedNode.type === 'pillar'
                          ? 'bg-indigo-100 text-indigo-800'
                          : selectedNode.type === 'cluster'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedNode.type === 'article'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedNode.type.toUpperCase()}
                    </span>
                    {selectedNode.ranking && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-extrabold text-[10px] border border-amber-200">
                        Top #{selectedNode.ranking} Google
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1 leading-snug">
                    {selectedNode.label}
                  </h3>
                </div>

                <button
                  onClick={() => onOpenEditKeyword?.(selectedNode)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                  title="Chỉnh sửa từ khóa"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Search Volume / tháng:</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {selectedNode.searchVolume.toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Độ khó từ khóa (KD):</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-base font-extrabold ${
                        selectedNode.difficulty > 60
                          ? 'text-rose-600'
                          : selectedNode.difficulty > 40
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {selectedNode.difficulty}/100
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({selectedNode.difficulty > 60 ? 'Cạnh tranh cao' : 'Khá dễ'})
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Giá thầu CPC:</div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {selectedNode.cpc.toLocaleString('vi-VN')} đ
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Ý định tìm kiếm (Intent):</div>
                  <div className="text-sm font-bold text-indigo-700 capitalize mt-0.5">
                    {selectedNode.intent}
                  </div>
                </div>
              </div>

              {/* Connected Linked Article */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Bài viết đã liên kết
                  </span>
                  {linkedArticle && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                      SEO Score: {linkedArticle.seoScore}/100
                    </span>
                  )}
                </div>

                {linkedArticle ? (
                  <div>
                    <div className="font-bold text-xs text-slate-900">{linkedArticle.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Tác giả: {linkedArticle.author} • {linkedArticle.wordCount} từ • Giai đoạn: <strong>{linkedArticle.stage}</strong>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-600 text-[11px]">
                      Chưa có bài viết liên kết trực tiếp cho từ khóa này.
                    </p>
                    {selectedNode.suggestedArticleTitle && (
                      <div className="mt-1 text-[11px] text-emerald-800 font-medium bg-white p-2 rounded-xl border border-emerald-100">
                        💡 <strong>Gợi ý tiêu đề AI:</strong> {selectedNode.suggestedArticleTitle}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenCreateArticle?.(selectedNode)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo dàn ý & Viết bài AI theo từ khóa này</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectKeyword?.(selectedNode)}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Network className="w-3.5 h-3.5 text-slate-600" />
                  <span>Xem cụm từ khóa liên quan ({connectedNodeIds.size - 1} node)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <Network className="w-12 h-12 text-slate-300" />
              <p className="text-xs">
                Nhấp vào bất kỳ node nào trong biểu đồ mạng để xem chi tiết thông số và kích hoạt viết bài SEO.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
