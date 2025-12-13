import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence, useDragControls, Reorder, DragControls } from 'framer-motion';
import { Search, Save, Users, X, Plus, Trash2, GripVertical, MousePointerClick, ArrowDown, Edit2 } from 'lucide-react';
import { clsx } from 'clsx';

// --- Metadata & Types ---

const FORM_METADATA = [
    {
        id: 'user_type',
        label: 'User Type',
        type: 'select',
        icon: Users,
        options: [
            { value: 'all', label: 'All Users' },
            { value: 'free', label: 'Free Plan' },
            { value: 'premium', label: 'Premium Plan' },
            { value: 'enterprise', label: 'Enterprise' }
        ],
        defaultValue: 'all'
    },
    {
        id: 'last_login',
        label: 'Last Login',
        type: 'radio',
        icon: MousePointerClick,
        options: [
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: 'never', label: 'Inactive' }
        ],
        defaultValue: '30d'
    },
    {
        id: 'region',
        label: 'Region',
        type: 'checkbox',
        icon: Search,
        options: [
            { value: 'jp', label: 'Japan' },
            { value: 'us', label: 'North America' },
            { value: 'eu', label: 'Europe' },
            { value: 'apac', label: 'Asia Pacific' }
        ],
        defaultValue: ['jp']
    },
    {
        id: 'custom_tags',
        label: 'Tags',
        type: 'tags',
        icon: Plus,
        placeholder: 'Type tag...',
        defaultValue: []
    },
    {
        id: 'age_range',
        label: 'Age Range',
        type: 'range',
        icon: Search,
        defaultValue: { min: '', max: '' }
    },
    {
        id: 'signup_date',
        label: 'Signup Date',
        type: 'date-range',
        icon: Search,
        defaultValue: { start: '', end: '' }
    },
    {
        id: 'description',
        label: 'Description',
        type: 'text',
        icon: Search,
        placeholder: 'Search description...',
        defaultValue: ''
    }
];

interface ConditionGroup {
    id: string;
    name: string;
    conditions: Record<string, any>;
    activeFields: string[];
}

// --- Components ---

interface FieldPaletteItemProps {
    field: typeof FORM_METADATA[0];
    onAdd: (fieldId: string, groupId?: string) => void;
    setHoveredGroupId: (id: string | null) => void;
}

const FieldPaletteItem = ({ field, onAdd, setHoveredGroupId }: FieldPaletteItemProps) => {
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
            onDrag={(event, info) => {
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
            onDragEnd={(event, info) => {
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
            <span className="text-sm font-medium text-slate-300 group-hover:text-white">{field.label}</span>
            <Plus size={16} className="ml-auto text-slate-600 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
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
    handleTagKeyDown
}: any) => {
    const controls = useDragControls();
    const meta = FORM_METADATA.find(f => f.id === fieldId);

    if (!meta) return null;

    return (
        <Reorder.Item
            value={fieldId}
            dragListener={false}
            dragControls={controls}
            className="relative"
        >
            {index > 0 && (
                <div className="flex items-center py-3"> {/* Increased vertical spacing */}
                    <div className="h-8 w-px bg-slate-600 ml-6"></div> {/* Higher Contrast Line */}
                    <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-600 uppercase tracking-wider shadow-sm">AND</span>
                </div>
            )}
            {/* ENHANCED CARD STYLING: Lighter bg (800) on Darker Group (900) */}
            <div className="bg-slate-800 border border-slate-600/50 shadow-md rounded-xl p-4 flex gap-4 items-start group/field relative z-10 hover:border-slate-500 transition-colors">
                {/* Drag Handle wired to controls */}
                <div
                    className="mt-2 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing touch-none transition-colors"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical size={16} />
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{meta.label}</label>
                        <button
                            onClick={() => removeFieldFromGroup(imgIdx, fieldId)}
                            className="text-slate-500 hover:text-red-400 opacity-0 group-hover/field:opacity-100 transition-all"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {meta.type === 'select' && (
                        <select
                            value={group.conditions[fieldId]}
                            onChange={(e) => updateConditionValue(imgIdx, fieldId, e.target.value)}
                            // INPUT STYLING: Recessed Look (bg-slate-950)
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        >
                            {meta.options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    )}

                    {meta.type === 'radio' && (
                        <div className="flex flex-wrap gap-2">
                            {meta.options?.map((opt: any) => (
                                <label key={opt.value} className={clsx(
                                    "cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm",
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

                    {(meta.type === 'range' || meta.type === 'date-range') && (
                        <div className="flex items-center gap-2">
                            <input
                                type={meta.type === 'range' ? 'number' : 'date'}
                                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder={meta.type === 'range' ? "Min" : "Start"}
                                value={group.conditions[fieldId][meta.type === 'range' ? 'min' : 'start']}
                                onChange={(e) => handleRangeUpdate(imgIdx, fieldId, meta.type === 'range' ? 'min' : 'start', e.target.value)}
                            />
                            <span className="text-xs text-slate-500 font-medium">to</span>
                            <input
                                type={meta.type === 'range' ? 'number' : 'date'}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                placeholder={meta.type === 'range' ? "Max" : "End"}
                                value={group.conditions[fieldId][meta.type === 'range' ? 'max' : 'end']}
                                onChange={(e) => handleRangeUpdate(imgIdx, fieldId, meta.type === 'range' ? 'max' : 'end', e.target.value)}
                            />
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
            activeFields: []
        };
    };

    const [groups, setGroups] = useState<ConditionGroup[]>([createInitialGroup(0)]);
    const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
    const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);

    // --- Actions ---

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
                activeFields: group.activeFields.filter(id => id !== fieldId)
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

    // --- Render Logic ---

    return (
        <div className="h-full flex flex-col md:flex-row bg-slate-950 overflow-hidden relative font-sans">

            {/* --- PALETTE SIDEBAR --- */}
            <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-2xl relative">
                <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} className="text-emerald-500" />
                        Fields
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 relative bg-slate-900">
                    {FORM_METADATA.map(field => (
                        <FieldPaletteItem
                            key={field.id}
                            field={field}
                            onAdd={(fid, gid) => addFieldToGroup(fid, gid)}
                            setHoveredGroupId={setHoveredGroupId}
                        />
                    ))}
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
                        <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700">Reset</button>
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
