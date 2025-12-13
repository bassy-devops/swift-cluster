import React, { useState, type KeyboardEvent } from 'react';
import { motion, AnimatePresence, useDragControls, Reorder } from 'framer-motion';
import { Search, Save, Users, X, Plus, Trash2, GripVertical, MousePointerClick, ArrowDown, Edit2, Database, Calculator, CheckCircle2, Clock, Calendar, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, Star, LayoutGrid, Activity, UserCircle2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

// --- Metadata & Types ---

type DateMode = 'absolute' | 'relative';
type RelativeDirection = 'ago' | 'future';
type TimeUnit = 'days' | 'weeks' | 'months';

interface DateConditionState {
    mode: DateMode;
    absolute: {
        start: string;
        end: string;
    };
    relative: {
        type: 'preset' | 'custom';
        presetId?: string;
        custom: {
            from: { value: number; unit: TimeUnit; direction: RelativeDirection };
            to: { value: number; unit: TimeUnit; direction: RelativeDirection };
        };
    };
}

const DEFAULT_DATE_CONDITION: DateConditionState = {
    mode: 'absolute',
    absolute: { start: '', end: '' },
    relative: {
        type: 'preset',
        presetId: 'last_30d',
        custom: {
            from: { value: 7, unit: 'days', direction: 'ago' },
            to: { value: 0, unit: 'days', direction: 'ago' }
        }
    }
};

type FieldCategory = 'Attributes' | 'Demographics' | 'Activity';

const FORM_METADATA = [
    {
        id: 'user_type',
        label: 'User Type',
        type: 'select',
        icon: Users,
        category: 'Attributes',
        options: [
            { value: 'all', label: 'All Users', count: '2.4M' },
            { value: 'free', label: 'Free Plan', count: '1.8M' },
            { value: 'premium', label: 'Premium Plan', count: '500K' },
            { value: 'enterprise', label: 'Enterprise', count: '100K' }
        ],
        defaultValue: 'all',
        mockCount: '2.4M'
    },
    {
        id: 'last_login',
        label: 'Last Login',
        type: 'radio',
        icon: MousePointerClick,
        category: 'Activity',
        options: [
            { value: '7d', label: '7 Days', count: '150K' },
            { value: '30d', label: '30 Days', count: '450K' },
            { value: '90d', label: '90 Days', count: '850K' },
            { value: 'never', label: 'Inactive', count: '1.5M' }
        ],
        defaultValue: '30d',
        mockCount: '850K'
    },
    {
        id: 'region',
        label: 'Region',
        type: 'checkbox',
        icon: Search,
        category: 'Demographics',
        options: [
            { value: 'jp', label: 'Japan', count: '450K' },
            { value: 'us', label: 'North America', count: '1.2M' },
            { value: 'eu', label: 'Europe', count: '600K' },
            { value: 'apac', label: 'Asia Pacific', count: '800K' }
        ],
        defaultValue: ['jp'],
        mockCount: '1.2M'
    },
    {
        id: 'custom_tags',
        label: 'Tags',
        type: 'tags',
        icon: Plus,
        category: 'Attributes',
        placeholder: 'Type tag...',
        defaultValue: [],
        mockCount: 'Varies'
    },
    {
        id: 'age_range',
        label: 'Age Range',
        type: 'range',
        icon: Search,
        category: 'Demographics',
        defaultValue: { min: '', max: '' },
        mockCount: 'All'
    },
    {
        id: 'signup_date',
        label: 'Signup Date',
        type: 'date-condition',
        icon: Search,
        category: 'Activity',
        defaultValue: DEFAULT_DATE_CONDITION,
        mockCount: 'All'
    },
    {
        id: 'description',
        label: 'Description',
        type: 'text',
        icon: Search,
        category: 'Attributes',
        placeholder: 'Search description...',
        defaultValue: '',
        mockCount: '-'
    }
];

interface ConditionGroup {
    id: string;
    name: string;
    conditions: Record<string, any>;
    activeFields: string[];
    collapsedFields: string[]; // Set of field IDs that are collapsed
}

// --- Helper Functions ---

const getPreviewDate = (val: number, unit: TimeUnit, dir: RelativeDirection) => {
    const date = new Date();
    const multiplier = dir === 'ago' ? -1 : 1;

    let daysToAdd = 0;
    if (unit === 'days') daysToAdd = val;
    if (unit === 'weeks') daysToAdd = val * 7;
    if (unit === 'months') daysToAdd = val * 30; // approx

    date.setDate(date.getDate() + (daysToAdd * multiplier));
    return date.toLocaleDateString();
};

const getConditionPreview = (_fieldId: string, value: any, meta: any): string => {
    if (!value) return '';

    switch (meta.type) {
        case 'select':
        case 'radio': {
            const opt = meta.options?.find((o: any) => o.value === value);
            return opt ? opt.label : String(value);
        }
        case 'checkbox': {
            const vals = value as string[];
            if (vals.length === 0) return 'None selected';
            if (vals.length > 3) return `${vals.length} selected`;
            const labels = vals.map(v => meta.options?.find((o: any) => o.value === v)?.label || v);
            return labels.join(', ');
        }
        case 'tags': {
            const tags = value as string[];
            if (tags.length === 0) return 'No tags';
            return tags.join(', ');
        }
        case 'text':
            return value ? `Contains "${value}"` : 'Empty';
        case 'range':
            return `${value.min || '0'} - ${value.max || '∞'}`;
        case 'date-condition': {
            const d = value as DateConditionState;
            if (d.mode === 'absolute') {
                return `${d.absolute.start || '?'} - ${d.absolute.end || '?'}`;
            } else {
                if (d.relative.type === 'preset') {
                    // Start Case
                    return d.relative.presetId?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Relative';
                }
                const from = getPreviewDate(d.relative.custom.from.value, d.relative.custom.from.unit, d.relative.custom.from.direction);
                const to = getPreviewDate(d.relative.custom.to.value, d.relative.custom.to.unit, d.relative.custom.to.direction);
                return `${from} - ${to} (Custom)`;
            }
        }
        default:
            return JSON.stringify(value);
    }
};


// --- Components ---

const DateConditionBuilder = ({
    value,
    onChange
}: {
    value: DateConditionState,
    onChange: (val: DateConditionState) => void
}) => {
    // Ensure value has correct structure if coming from old state
    const safeValue = value?.mode ? value : DEFAULT_DATE_CONDITION;

    const updateMode = (mode: DateMode) => onChange({ ...safeValue, mode });

    // Absolute Handlers
    const updateAbsolute = (field: 'start' | 'end', val: string) => {
        onChange({
            ...safeValue,
            absolute: { ...safeValue.absolute, [field]: val }
        });
    };

    // Relative Handlers
    const updateRelativeType = (type: 'preset' | 'custom') => {
        onChange({
            ...safeValue,
            relative: { ...safeValue.relative, type }
        });
    };

    const updatePreset = (presetId: string) => {
        onChange({
            ...safeValue,
            relative: { ...safeValue.relative, type: 'preset', presetId }
        });
    };

    const updateCustom = (pos: 'from' | 'to', field: string, val: any) => {
        onChange({
            ...safeValue,
            relative: {
                ...safeValue.relative,
                type: 'custom',
                custom: {
                    ...safeValue.relative.custom,
                    [pos]: { ...safeValue.relative.custom[pos], [field]: val }
                }
            }
        });
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Mode Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700 self-start">
                <button
                    onClick={() => updateMode('absolute')}
                    className={clsx(
                        "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                        safeValue.mode === 'absolute'
                            ? "bg-slate-800 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    <Calendar size={12} />
                    Absolute
                </button>
                <button
                    onClick={() => updateMode('relative')}
                    className={clsx(
                        "px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                        safeValue.mode === 'relative'
                            ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                            : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    <Clock size={12} />
                    Relative
                </button>
            </div>

            {/* Absolute Input */}
            {safeValue.mode === 'absolute' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                        type="date"
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        value={safeValue.absolute.start}
                        onChange={(e) => updateAbsolute('start', e.target.value)}
                    />
                    <span className="text-xs text-slate-500 font-medium">to</span>
                    <input
                        type="date"
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        value={safeValue.absolute.end}
                        onChange={(e) => updateAbsolute('end', e.target.value)}
                    />
                </div>
            )}

            {/* Relative Input */}
            {safeValue.mode === 'relative' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Preset vs Custom Toggle */}
                    <div className="flex gap-2">
                        <select
                            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:border-emerald-500 outline-none"
                            value={safeValue.relative.type === 'preset' ? safeValue.relative.presetId : 'custom'}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') updateRelativeType('custom');
                                else updatePreset(val);
                            }}
                        >
                            <option value="last_7d">Last 7 Days</option>
                            <option value="last_30d">Last 30 Days</option>
                            <option value="next_30d">Next 30 Days</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="today">Today</option>
                            <option value="custom">Custom Range...</option>
                        </select>
                    </div>

                    {/* Custom Builder */}
                    {safeValue.relative.type === 'custom' && (
                        <div className="bg-slate-950/50 border border-slate-700/50 rounded-lg p-3 space-y-3">
                            {/* FROM ROW */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 w-8">FROM</span>
                                <input
                                    type="number" min="0"
                                    className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-center text-white focus:border-emerald-500 outline-none"
                                    value={safeValue.relative.custom.from.value}
                                    onChange={(e) => updateCustom('from', 'value', parseInt(e.target.value))}
                                />
                                <select
                                    className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 outline-none"
                                    value={safeValue.relative.custom.from.unit}
                                    onChange={(e) => updateCustom('from', 'unit', e.target.value)}
                                >
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                    <option value="months">Months</option>
                                </select>
                                <select
                                    className={clsx(
                                        "bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 outline-none font-medium",
                                        safeValue.relative.custom.from.direction === 'ago' ? "text-amber-400" : "text-emerald-400"
                                    )}
                                    value={safeValue.relative.custom.from.direction}
                                    onChange={(e) => updateCustom('from', 'direction', e.target.value)}
                                >
                                    <option value="ago">Ago</option>
                                    <option value="future">Future</option>
                                </select>
                            </div>

                            {/* TO ROW */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 w-8">TO</span>
                                <input
                                    type="number" min="0"
                                    className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-center text-white focus:border-emerald-500 outline-none"
                                    value={safeValue.relative.custom.to.value}
                                    onChange={(e) => updateCustom('to', 'value', parseInt(e.target.value))}
                                />
                                <select
                                    className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 outline-none"
                                    value={safeValue.relative.custom.to.unit}
                                    onChange={(e) => updateCustom('to', 'unit', e.target.value)}
                                >
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                    <option value="months">Months</option>
                                </select>
                                <select
                                    className={clsx(
                                        "bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 outline-none font-medium",
                                        safeValue.relative.custom.to.direction === 'ago' ? "text-amber-400" : "text-emerald-400"
                                    )}
                                    value={safeValue.relative.custom.to.direction}
                                    onChange={(e) => updateCustom('to', 'direction', e.target.value)}
                                >
                                    <option value="ago">Ago</option>
                                    <option value="future">Future</option>
                                </select>
                            </div>

                            {/* DATE PREVIEW */}
                            <div className="pt-2 border-t border-slate-700/30 text-right">
                                <span className="text-[10px] text-slate-500 mr-2">PREVIEW (IF RUN TODAY):</span>
                                <span className="text-xs font-mono text-emerald-400">
                                    {getPreviewDate(safeValue.relative.custom.from.value, safeValue.relative.custom.from.unit, safeValue.relative.custom.from.direction)}
                                    {' - '}
                                    {getPreviewDate(safeValue.relative.custom.to.value, safeValue.relative.custom.to.unit, safeValue.relative.custom.to.direction)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


interface FieldPaletteItemProps {
    field: typeof FORM_METADATA[0];
    isFavorite: boolean;
    onAdd: (fieldId: string, groupId?: string) => void;
    onToggleFavorite: (e: React.MouseEvent, fieldId: string) => void;
    setHoveredGroupId: (id: string | null) => void;
}

const FieldPaletteItem = ({ field, isFavorite, onAdd, onToggleFavorite, setHoveredGroupId }: FieldPaletteItemProps) => {
    const controls = useDragControls();

    return (
        <motion.div
            drag
            dragControls={controls}
            dragSnapToOrigin
            dragElastic={0.1}
            whileDrag={{ scale: 1.05, zIndex: 9999, opacity: 0.9, position: 'fixed', pointerEvents: 'none' }}
            onDragStart={() => {
                document.body.style.cursor = 'grabbing';
            }}
            onDrag={(_, info) => {
                const point = { x: info.point.x, y: info.point.y };
                const element = document.elementFromPoint(point.x, point.y);
                if (element) {
                    const dropZone = element.closest('[data-drop-zone="true"]');
                    if (dropZone) {
                        const gid = dropZone.getAttribute('data-group-id');
                        setHoveredGroupId(gid);
                    } else {
                        setHoveredGroupId(null);
                    }
                }
            }}
            onDragEnd={(_, info) => {
                document.body.style.cursor = '';
                setHoveredGroupId(null);

                const point = { x: info.point.x, y: info.point.y };
                const element = document.elementFromPoint(point.x, point.y);

                const dropZone = element?.closest('[data-drop-zone="true"]');
                if (dropZone) {
                    const groupId = dropZone.getAttribute('data-group-id');
                    if (groupId) {
                        onAdd(field.id, groupId);
                        return;
                    }
                }

                const canvasZone = element?.closest('[data-canvas-zone="true"]');
                if (canvasZone) {
                    onAdd(field.id);
                }
            }}
            className="bg-slate-800 border border-slate-700 shadow-sm p-3 rounded-xl flex items-center gap-3 hover:bg-slate-700 hover:border-emerald-500/50 transition-all cursor-grab active:cursor-grabbing group relative select-none z-10"
            onClick={() => onAdd(field.id)}
        >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                <field.icon size={16} />
            </div>

            <div className="flex-1">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white block">{field.label}</span>
                <span className="text-[10px] text-slate-600 block">{field.category}</span>
            </div>

            {/* Favorite Star */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    onToggleFavorite(e, field.id);
                }}
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                className={clsx(
                    "p-1.5 rounded-lg transition-colors z-20",
                    isFavorite ? "text-amber-400 hover:bg-amber-400/10" : "text-slate-600 hover:text-amber-400 hover:bg-slate-600/10 opacity-0 group-hover:opacity-100"
                )}
            >
                <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
            </button>

            <Plus size={16} className="text-slate-600 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
        </motion.div>
    );
};

// Refactored Component for Draggable Item to properly handle Drag Controls
const DraggableConditionItem = ({
    fieldId,
    group,
    index,
    imgIdx,
    removeFieldFromGroup,
    updateConditionValue,
    handleRangeUpdate,
    tagInputs,
    setTagInputs,
    handleTagKeyDown,
    toggleCollapse
}: any) => {
    const controls = useDragControls();
    const meta = FORM_METADATA.find(f => f.id === fieldId);
    if (!meta) return null;

    const isCollapsed = group.collapsedFields?.includes(fieldId);
    const value = group.conditions[fieldId];
    const previewText = getConditionPreview(fieldId, value, meta);

    return (
        <Reorder.Item
            value={fieldId}
            dragListener={false}
            dragControls={controls}
            className="relative"
        >
            {index > 0 && (
                <div className="flex items-center py-2"> {/* Condensed vertical spacing */}
                    <div className="h-4 w-px bg-slate-700 ml-6"></div>
                    <span className="ml-3 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-slate-800 text-slate-500 border border-slate-700/50 uppercase tracking-wider">AND</span>
                </div>
            )}
            {/* ENHANCED CARD STYLING */}
            <div className={clsx(
                "bg-slate-800 border shadow-md rounded-xl transition-all overflow-hidden",
                isCollapsed ? "border-slate-700/50 hover:border-slate-600 p-3 items-center flex gap-4" : "border-slate-600/50 p-4 flex gap-4 items-start"
            )}>
                {/* Drag Handle */}
                <div
                    className={clsx(
                        "text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing touch-none transition-colors",
                        isCollapsed ? "" : "mt-2"
                    )}
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical size={16} />
                </div>

                <div className="flex-1 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                        <div
                            className="flex items-center gap-3 cursor-pointer group/header flex-1"
                            onClick={() => toggleCollapse(imgIdx, fieldId)}
                        >
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                                {meta.label}
                                {!isCollapsed && ( // Badge only when expanded or always? Let's show simplified badge
                                    <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-normal flex items-center gap-1">
                                        <Users size={10} />
                                        {meta.mockCount}
                                    </span>
                                )}
                            </label>

                            {/* Collapse/Expand Icon */}
                            <div className="text-slate-500 group-hover/header:text-slate-300 transition-colors">
                                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </div>

                            {/* PREVIEW TEXT (When Collapsed) */}
                            {isCollapsed && (
                                <span className="text-sm font-medium text-emerald-400 truncate max-w-[300px] animate-in fade-in slide-in-from-left-2">
                                    {previewText}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => removeFieldFromGroup(imgIdx, fieldId)}
                            className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-2"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* EXPANDED CONTENT */}
                    {!isCollapsed && (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                            {meta.type === 'select' && (
                                <select
                                    value={group.conditions[fieldId]}
                                    onChange={(e) => updateConditionValue(imgIdx, fieldId, e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                >
                                    {meta.options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            )}

                            {meta.type === 'radio' && (
                                <div className="flex flex-wrap gap-2">
                                    {meta.options?.map((opt: any) => (
                                        <label key={opt.value} className={clsx(
                                            "cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm flex items-center gap-2",
                                            group.conditions[fieldId] === opt.value
                                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-emerald-900/20"
                                                : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                                        )}>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                value={opt.value}
                                                checked={group.conditions[fieldId] === opt.value}
                                                onChange={() => updateConditionValue(imgIdx, fieldId, opt.value)}
                                            />
                                            {opt.label}
                                            {opt.count && (
                                                <span className={clsx(
                                                    "text-[10px]",
                                                    group.conditions[fieldId] === opt.value ? "text-emerald-400/70" : "text-slate-600"
                                                )}>({opt.count})</span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {meta.type === 'checkbox' && (
                                <div className="flex flex-wrap gap-2">
                                    {meta.options?.map((opt: any) => {
                                        const isChecked = (group.conditions[fieldId] as string[]).includes(opt.value);
                                        return (
                                            <label key={opt.value} className={clsx(
                                                "cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 shadow-sm",
                                                isChecked
                                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-emerald-900/20"
                                                    : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                                            )}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        const current = group.conditions[fieldId] as string[];
                                                        const newVal = current.includes(opt.value)
                                                            ? current.filter(v => v !== opt.value)
                                                            : [...current, opt.value];
                                                        updateConditionValue(imgIdx, fieldId, newVal);
                                                    }}
                                                />
                                                {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
                                                {opt.label}
                                                {opt.count && (
                                                    <span className={clsx(
                                                        "text-[10px]",
                                                        isChecked ? "text-emerald-400/70" : "text-slate-600"
                                                    )}>({opt.count})</span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {meta.type === 'tags' && (
                                <div className="flex flex-wrap gap-2 bg-slate-950 border border-slate-700 rounded-lg p-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
                                    {(group.conditions[fieldId] as string[]).map((tag: string) => (
                                        <span key={tag} className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                            {tag}
                                            <button onClick={() => {
                                                const current = group.conditions[fieldId] as string[];
                                                updateConditionValue(imgIdx, fieldId, current.filter(t => t !== tag));
                                            }} className="hover:text-emerald-100">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder={meta.placeholder}
                                        className="bg-transparent border-none text-slate-200 text-sm focus:ring-0 p-0 placeholder:text-slate-600 flex-1 min-w-[80px]"
                                        value={tagInputs[`${imgIdx}-${fieldId}`] || ''}
                                        onChange={e => setTagInputs((prev: any) => ({ ...prev, [`${imgIdx}-${fieldId}`]: e.target.value }))}
                                        onKeyDown={e => handleTagKeyDown(e, imgIdx, fieldId, group.conditions[fieldId])}
                                    />
                                </div>
                            )}

                            {meta.type === 'text' && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none pl-9 transition-all"
                                        placeholder={meta.placeholder}
                                        value={group.conditions[fieldId]}
                                        onChange={(e) => updateConditionValue(imgIdx, fieldId, e.target.value)}
                                    />
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    {group.conditions[fieldId] && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shadow-sm">LIKE</span>}
                                </div>
                            )}

                            {meta.type === 'range' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Min"
                                        value={group.conditions[fieldId]['min']}
                                        onChange={(e) => handleRangeUpdate(imgIdx, fieldId, 'min', e.target.value)}
                                    />
                                    <span className="text-xs text-slate-500 font-medium">to</span>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                        placeholder="Max"
                                        value={group.conditions[fieldId]['max']}
                                        onChange={(e) => handleRangeUpdate(imgIdx, fieldId, 'max', e.target.value)}
                                    />
                                </div>
                            )}

                            {meta.type === 'date-condition' && (
                                <DateConditionBuilder
                                    value={group.conditions[fieldId]}
                                    onChange={(val) => updateConditionValue(imgIdx, fieldId, val)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Reorder.Item>
    );
};

export const UserSegmentView: React.FC = () => {
    // --- State ---
    const createInitialGroup = (index = 0): ConditionGroup => {
        const initialConditions: Record<string, any> = {};
        FORM_METADATA.forEach(f => initialConditions[f.id] = f.defaultValue);
        return {
            id: Math.random().toString(36).substring(2, 9),
            name: `Segment Group ${index + 1}`,
            conditions: initialConditions,
            activeFields: [],
            collapsedFields: []
        };
    };

    const [groups, setGroups] = useState<ConditionGroup[]>([createInitialGroup(0)]);
    const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
    const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
    const [favoriteFields, setFavoriteFields] = useState<string[]>([]);
    const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);

    // Calculation State
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationStep, setCalculationStep] = useState(0);
    const [calculationResult, setCalculationResult] = useState<string | null>(null);
    const [finalAudience, setFinalAudience] = useState<string | null>(null);

    // --- Actions ---

    const toggleFavorite = (e: React.MouseEvent, fieldId: string) => {
        e.stopPropagation();
        setFavoriteFields(prev =>
            prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]
        );
    };

    const toggleCategory = (catId: string) => {
        setCollapsedCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    // Calculation Logic
    const startCalculation = () => {
        setIsCalculating(true);
        setCalculationStep(0);
        setCalculationResult(null);

        const steps = [
            { delay: 1000, step: 1 }, // Connecting
            { delay: 2500, step: 2 }, // Scanning
            { delay: 3500, step: 3 }, // Filtering
            { delay: 4500, step: 4 }, // Aggregating
            { delay: 5000, step: 5 }  // Done
        ];

        steps.forEach(({ delay, step }) => {
            setTimeout(() => {
                setCalculationStep(step);
                if (step === 5) {
                    // Generate random realistic number
                    const num = Math.floor(Math.random() * (250000 - 50000) + 50000).toLocaleString();
                    setCalculationResult(`${num} Users`);
                }
            }, delay);
        });
    };

    const closeCalculation = () => {
        if (calculationResult) {
            setFinalAudience(calculationResult);
        }
        setIsCalculating(false);
        setCalculationStep(0);
        setCalculationResult(null);
    };

    const addFieldToGroup = (fieldId: string, targetGroupId?: string) => {
        setGroups(prev => {
            const newGroups = [...prev];
            let targetIndex = newGroups.length - 1;
            if (targetGroupId) {
                const idx = newGroups.findIndex(g => g.id === targetGroupId);
                if (idx !== -1) targetIndex = idx;
            }

            const group = newGroups[targetIndex];

            if (!group.activeFields.includes(fieldId)) {
                newGroups[targetIndex] = {
                    ...group,
                    activeFields: [...group.activeFields, fieldId]
                };
            }
            return newGroups;
        });
    };

    const removeFieldFromGroup = (groupIndex: number, fieldId: string) => {
        setGroups(prev => {
            const newGroups = [...prev];
            const group = newGroups[groupIndex];
            newGroups[groupIndex] = {
                ...group,
                activeFields: group.activeFields.filter(id => id !== fieldId),
                collapsedFields: group.collapsedFields.filter(id => id !== fieldId) // Cleanup
            };
            return newGroups;
        });
    };

    // Toggle Collapse
    const toggleCollapse = (groupIndex: number, fieldId: string) => {
        setGroups(prev => {
            const newGroups = [...prev];
            const group = newGroups[groupIndex];
            const isCollapsed = group.collapsedFields.includes(fieldId);

            newGroups[groupIndex] = {
                ...group,
                collapsedFields: isCollapsed
                    ? group.collapsedFields.filter(id => id !== fieldId)
                    : [...group.collapsedFields, fieldId]
            };
            return newGroups;
        });
    };

    // Toggle All in Group
    const toggleAllCollapse = (groupIndex: number, shouldCollapse: boolean) => {
        setGroups(prev => {
            const newGroups = [...prev];
            const group = newGroups[groupIndex];
            newGroups[groupIndex] = {
                ...group,
                collapsedFields: shouldCollapse ? [...group.activeFields] : []
            };
            return newGroups;
        });
    };

    // Handle Reordering
    const handleReorder = (groupIndex: number, newOrder: string[]) => {
        setGroups(prev => {
            const newGroups = [...prev];
            newGroups[groupIndex] = {
                ...newGroups[groupIndex],
                activeFields: newOrder
            };
            return newGroups;
        });
    };

    const updateConditionValue = (groupIndex: number, fieldId: string, value: any) => {
        setGroups(prev => {
            const newGroups = [...prev];
            newGroups[groupIndex] = {
                ...newGroups[groupIndex],
                conditions: {
                    ...newGroups[groupIndex].conditions,
                    [fieldId]: value
                }
            };
            return newGroups;
        });
    };

    const updateGroupName = (groupIndex: number, newName: string) => {
        setGroups(prev => {
            const newGroups = [...prev];
            newGroups[groupIndex] = { ...newGroups[groupIndex], name: newName };
            return newGroups;
        });
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>, groupIndex: number, fieldId: string, currentTags: string[]) => {
        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            updateConditionValue(groupIndex, fieldId, [...currentTags, val]);
            setTagInputs(prev => ({ ...prev, [`${groupIndex}-${fieldId}`]: '' }));
        }
    };

    const handleRangeUpdate = (groupIndex: number, fieldId: string, subField: string, val: string) => {
        setGroups(prev => {
            const current = prev[groupIndex].conditions[fieldId] || {};
            const newVal = { ...current, [subField]: val };
            const newGroups = [...prev];
            newGroups[groupIndex] = {
                ...newGroups[groupIndex],
                conditions: {
                    ...newGroups[groupIndex].conditions,
                    [fieldId]: newVal
                }
            };
            return newGroups;
        });
    };

    const addGroup = () => setGroups(prev => [...prev, createInitialGroup(prev.length)]);
    const removeGroup = (index: number) => setGroups(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = () => {
        const payload = groups.map(g => {
            const activeConditions: Record<string, any> = {};
            g.activeFields.forEach(fid => {
                activeConditions[fid] = g.conditions[fid];
            });
            return { id: g.id, name: g.name, conditions: activeConditions };
        });
        console.log('Building Segment:', payload);
        alert('Segment built! Check console.');
    };

    const CALC_STEPS = [
        "Initializing Query...",
        "Connecting to BigQuery...",
        "Scanning 12.4TB Dataset...",
        "Applying Condition Filters...",
        "Aggregating Final Audience..."
    ];

    const RENDER_CATEGORIES: { id: FieldCategory, icon: any }[] = [
        { id: 'Attributes', icon: LayoutGrid },
        { id: 'Demographics', icon: UserCircle2 },
        { id: 'Activity', icon: Activity },
    ];

    // --- Render Logic ---

    // Calculation Overlay
    const renderCalculationOverlay = () => (
        <AnimatePresence>
            {isCalculating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none" />

                        {!calculationResult ? (
                            <>
                                <div className="mb-8 relative">
                                    <Database size={48} className="text-slate-700 relative z-10" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 -m-4 border-2 border-dashed border-emerald-500/30 rounded-full z-0"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 -m-2 border border-emerald-500/20 rounded-full z-0"
                                    />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">Calculating Audience</h3>
                                <div className="h-6 mb-6">
                                    <AnimatePresence mode='wait'>
                                        <motion.p
                                            key={calculationStep}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-sm text-emerald-400 font-mono"
                                        >
                                            {CALC_STEPS[calculationStep] || "Processing..."}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>

                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${(calculationStep / 4) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mb-6 w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400"
                                >
                                    <CheckCircle2 size={32} />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-1">Estimated Audience</h3>
                                <p className="text-slate-400 mb-6 text-sm">Based on current filters</p>

                                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl px-8 py-6 mb-8 flex flex-col items-center">
                                    <span className="text-4xl font-black text-white tracking-tight">{calculationResult}</span>
                                    <span className="text-slate-500 text-xs uppercase tracking-wider mt-1">Total Unique Users</span>
                                </div>

                                <div className="flex gap-3 w-full">
                                    <button onClick={closeCalculation} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors">
                                        Back to Edit
                                    </button>
                                    <button onClick={() => { alert('Saved!'); closeCalculation(); }} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-lg shadow-emerald-900/20">
                                        Confirm & Save
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="h-full flex flex-col md:flex-row bg-slate-950 overflow-hidden relative font-sans">

            {renderCalculationOverlay()}

            {/* --- PALETTE SIDEBAR --- */}
            <div className="w-full md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-2xl relative">
                <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} className="text-emerald-500" />
                        Condition Library
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 relative bg-slate-900 scrollbar-thin scrollbar-thumb-slate-800">

                    {/* FAVORITES SECTION */}
                    {favoriteFields.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-amber-500/90 uppercase tracking-wider flex items-center gap-2 px-2">
                                <Star size={12} fill="currentColor" />
                                Favorites
                            </h3>
                            <div className="space-y-2">
                                {favoriteFields.map(fid => {
                                    const field = FORM_METADATA.find(f => f.id === fid);
                                    if (!field) return null;
                                    return (
                                        <FieldPaletteItem
                                            key={`fav-${field.id}`}
                                            field={field}
                                            isFavorite={true}
                                            onAdd={(f, g) => addFieldToGroup(f, g)}
                                            onToggleFavorite={toggleFavorite}
                                            setHoveredGroupId={setHoveredGroupId}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* CATEGORIES */}
                    {RENDER_CATEGORIES.map(cat => {
                        const fields = FORM_METADATA.filter(f => f.category === cat.id);
                        if (fields.length === 0) return null;
                        const isCollapsed = collapsedCategories.includes(cat.id);

                        return (
                            <div key={cat.id} className="space-y-3">
                                {/* CATEGORY HEADER */}
                                <button
                                    onClick={() => toggleCategory(cat.id)}
                                    className="w-full flex items-center justify-between group/catheader hover:bg-slate-800/50 p-2 rounded-lg -mx-2 transition-colors"
                                >
                                    <h3 className="text-xs font-bold text-slate-500 group-hover/catheader:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <cat.icon size={12} />
                                        {cat.id}
                                    </h3>
                                    <div className="text-slate-600 group-hover/catheader:text-slate-400">
                                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                    </div>
                                </button>

                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        {fields.map(field => (
                                            <FieldPaletteItem
                                                key={field.id}
                                                field={field}
                                                isFavorite={favoriteFields.includes(field.id)}
                                                onAdd={(f, g) => addFieldToGroup(f, g)}
                                                onToggleFavorite={toggleFavorite}
                                                setHoveredGroupId={setHoveredGroupId}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}

                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <p className="text-[10px] text-slate-500 text-center">
                        Drag fields to the canvas or click to add.
                    </p>
                </div>
            </div>

            {/* --- CANVAS AREA --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 z-0">

                {/* Header */}
                <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md z-10 sticky top-0 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Segment Builder</h1>
                        <p className="text-sm text-slate-400 mt-1">Construct complex user segments dynamically.</p>
                    </div>
                    <div className="flex gap-3">
                        {/* PERSISTED ESTIMATION RESULT */}
                        {finalAudience && (
                            <div className="flex flex-col items-end justify-center mr-4 animate-in fade-in slide-in-from-top-2">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Total Audience</span>
                                <span className="text-lg font-black text-white leading-none">{finalAudience}</span>
                            </div>
                        )}

                        {/* ESTIMATE BUTTON */}
                        <button
                            onClick={startCalculation}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2"
                        >
                            <Calculator size={16} />
                            Estimate Audience
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 ring-offset-2 ring-offset-slate-950 focus:ring-2 focus:ring-emerald-500"
                        >
                            <Save size={16} />
                            Save Segment
                        </button>
                    </div>
                </header>

                {/* Scrollable Canvas */}
                <div
                    className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20"
                    data-canvas-zone="true"
                >

                    <AnimatePresence mode='popLayout'>
                        {groups.map((group, imgIdx) => {
                            const isHovered = hoveredGroupId === group.id;

                            return (
                                <React.Fragment key={group.id}>
                                    {imgIdx > 0 && (
                                        <div className="flex items-center justify-center py-4 opacity-70">
                                            <div className="h-px w-12 bg-slate-700"></div>
                                            <span className="mx-4 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-800">OR</span>
                                            <div className="h-px w-12 bg-slate-700"></div>
                                        </div>
                                    )}

                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{
                                            opacity: 1,
                                            scale: isHovered ? 1.02 : 1, // Slight scale up on hover
                                            borderColor: isHovered ? 'rgba(16, 185, 129, 0.5)' : 'rgba(51, 65, 85, 0.5)', // Slate-700 ish
                                            backgroundColor: isHovered ? 'rgba(16, 185, 129, 0.05)' : 'rgba(15, 23, 42, 1)', // Slate-900 solid
                                            boxShadow: isHovered ? '0 0 0 4px rgba(16, 185, 129, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        data-drop-zone="true"
                                        data-group-id={group.id}
                                        className={clsx(
                                            "border rounded-2xl p-6 min-h-[140px] relative transition-all shadow-xl",
                                            !isHovered && "hover:border-slate-600"
                                        )}
                                    >
                                        {/* Group Header */}
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                                            <div className="flex items-center gap-3 group/title">
                                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                                <input
                                                    type="text"
                                                    value={group.name}
                                                    onChange={(e) => updateGroupName(imgIdx, e.target.value)}
                                                    className="bg-transparent text-base font-bold text-slate-200 focus:text-white focus:outline-none border-b border-transparent focus:border-emerald-500 transition-colors w-auto min-w-[200px]"
                                                />
                                                <Edit2 size={12} className="text-slate-600 group-hover/title:text-slate-400 opacity-0 group-hover/title:opacity-100 transition-all pointer-events-none" />
                                            </div>

                                            {/* GLOBAL COLLAPSE CONTROLS */}
                                            {group.activeFields.length > 0 && (
                                                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 mr-auto ml-4">
                                                    <button
                                                        onClick={() => toggleAllCollapse(imgIdx, true)}
                                                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"
                                                        title="Collapse All"
                                                    >
                                                        <ChevronsUp size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleAllCollapse(imgIdx, false)}
                                                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"
                                                        title="Expand All"
                                                    >
                                                        <ChevronsDown size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            {groups.length > 1 && (
                                                <button
                                                    onClick={() => removeGroup(imgIdx)}
                                                    className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors z-20"
                                                    title="Remove Group"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* REORDERABLE CONDITIONS LIST */}
                                        <Reorder.Group
                                            axis="y"
                                            values={group.activeFields}
                                            onReorder={(newOrder) => handleReorder(imgIdx, newOrder)}
                                            className="grid gap-0"
                                        >
                                            <AnimatePresence>
                                                {group.activeFields.map((fieldId, index) => (
                                                    <DraggableConditionItem
                                                        key={`${group.id}-${fieldId}`}
                                                        fieldId={fieldId}
                                                        group={group}
                                                        index={index}
                                                        imgIdx={imgIdx}
                                                        removeFieldFromGroup={removeFieldFromGroup}
                                                        updateConditionValue={updateConditionValue}
                                                        handleRangeUpdate={handleRangeUpdate}
                                                        tagInputs={tagInputs}
                                                        setTagInputs={setTagInputs}
                                                        handleTagKeyDown={handleTagKeyDown}
                                                        toggleCollapse={toggleCollapse}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </Reorder.Group>

                                        {/* Drop Hint */}
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 rounded-xl h-24 flex flex-col items-center justify-center text-emerald-400 gap-2"
                                            >
                                                <ArrowDown size={24} className="animate-bounce" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Drop Here</span>
                                            </motion.div>
                                        )}

                                        {/* Fallback Empty State */}
                                        {group.activeFields.length === 0 && !isHovered && (
                                            <div className="flex flex-col items-center justify-center py-12 opacity-40">
                                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                                    <Plus size={24} className="text-slate-500" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-400">Drag fields here to start building</p>
                                            </div>
                                        )}

                                    </motion.div>
                                </React.Fragment>
                            );
                        })}
                    </AnimatePresence>

                    <button
                        onClick={addGroup}
                        className="w-full py-6 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-3 font-medium group"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors">
                            <Plus size={16} />
                        </div>
                        Add Another OR Group
                    </button>
                    <div className="h-20" />
                </div>
            </div>
        </div>
    );
};
