//This component is used to create a why-why analysis tree - FIXED VERSION

'use-client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, Handle, Position, Panel, BackgroundVariant, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import dagre from 'dagre';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { INCIDENT_RCA_FACTOR } from '@/config/apiConfig';
import { selectUserToken } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';
import { LuCircleCheck, LuPlus, LuTrash2 } from 'react-icons/lu';
import { IoClose } from 'react-icons/io5';
import '@/styles/custom/components/why-why-analysis/whywhy.scss';
import { toast } from "react-toastify";
import { LuLoader } from 'react-icons/lu';
import { color } from 'highcharts';

export type NodeStatus = 'new' | 'concluded';
export interface WhyNodeData {
  id: string;
  label: string;
  factor?: string;
  subFactor?: string;
  status: NodeStatus;
  isDiscarded?: boolean;
  children: WhyNodeData[];
  questionId?: string; // ADDED: Store the questionId separately from the node id
}
export interface FactorOption {
  id: number;
  label: string;
}
export interface FactorsData {
  system: FactorOption[];
  human: FactorOption[];
  unsafeAct: FactorOption[];
  unsafeCondition: FactorOption[];
}
export interface WhyAnalysisPayload {
  whyQuestion: string;
  whyAnswer: string;
  whyConclusive: 'Yes' | 'No';
  whyConclusion: string;
  pirId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  questionId: string;
  questionRefId: string;
  levelNo: string;
  factorType: string;
  status: string;
  factorDetail: string;
  prevRefId: string | null;
  factorDetailType: string | null;
  physicalFactorType: string | null;
}
export interface WhyWhyAnalysisProps {
  initialData?: WhyNodeData;
  incidentId?: string;
  onTreeChange?: (paylode: WhyNodeData) => void;
  onSubmit?: (whyAnalyses: any, imageFile?: File) => void;
  onClose?: () => void;
  readOnly?: boolean;
  width?: string;
  height?: string;
}

interface NodeCardProps {
  data: WhyNodeData;
  isRoot: boolean;
  factorsData: FactorsData;
  onUpdate: (id: string, updates: Partial<WhyNodeData>) => void;
  onConclude: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
  onDeleteHover: (id: string) => void;
  onDeleteLeave: () => void;
  onDiscardBranch: (id: string) => void;
  readOnly?: boolean;
}
const NodeCard: React.FC<NodeCardProps> = ({
  data,
  isRoot,
  factorsData,
  onUpdate,
  onConclude,
  onDelete,
  onAddChild,
  onDeleteHover,
  onDeleteLeave,
  onDiscardBranch,
  readOnly = false,
}) => {
  const [subFactorOptions, setSubFactorOptions] = useState<FactorOption[]>([]);
  const [localLabel, setLocalLabel] = useState(data.label);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalLabel(data.label);
  }, [data.label]);

  useEffect(() => {
    // Auto-resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localLabel]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalLabel(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onUpdate(data.id, { label: value });
    }, 150);
  };

  useEffect(() => {
    if (data.factor) {
      switch (data.factor) {
        case 'System Factor':
          setSubFactorOptions(factorsData.system);
          break;
        case 'Human Factor':
          setSubFactorOptions(factorsData.human);
          break;
        case 'Unsafe Act':
          setSubFactorOptions(factorsData.unsafeAct);
          break;
        case 'Unsafe Condition':
          setSubFactorOptions(factorsData.unsafeCondition);
          break;
        default:
          setSubFactorOptions([]);
      }
    } else {
      setSubFactorOptions([]);
    }
  }, [data.factor, factorsData]);
  
  return (
    <div className="why-node-card">
      <textarea
        ref={textareaRef}
        value={localLabel}
        onChange={handleLabelChange}
        placeholder={isRoot ? 'Define the Problem...' : 'Why did that happen?'}
        className="node-textarea"
        rows={1}
        style={{ minHeight: '40px', resize: 'vertical' }}
        readOnly={readOnly}
      />
      {!isRoot && (
        <>
          <select value={data.factor || ''} onChange={(e) => onUpdate(data.id, { factor: e.target.value, subFactor: '' })} className="node-select" disabled={readOnly}>
            <option value="">Choose factor</option>
            <option value="System Factor">System Factor</option>
            <option value="Human Factor">Human Factor</option>
            <option value="Unsafe Act">Physical (Unsafe Act)</option>
            <option value="Unsafe Condition">Physical (Unsafe Condition)</option>
          </select>
          {data.factor && (
            <select value={data.subFactor || ''} onChange={(e) => onUpdate(data.id, { subFactor: e.target.value })} className="node-select" disabled={readOnly}>
              <option value="">Choose sub-factor</option>
              {subFactorOptions.map((option) => (
                <option key={option.id} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </>
      )}
      {!readOnly && (
        <div className="node-actions">
          <button type="button" className="btn-add" onClick={() => onAddChild(data.id)} title="Add Cause">
            <LuPlus />
          </button>
          {!isRoot && (
            <>
              {data.children.length === 0 && (
                <button type="button" className="btn-conclude" onClick={() => onConclude(data.id)} title="Conclude as Root Cause">
                  <LuCircleCheck />
                </button>
              )}
              <button type="button" className="btn-discard" onClick={() => onDiscardBranch(data.id)} title="Mark branch as incorrect">
                <IoClose />
              </button>
              <button type="button" className="btn-delete" onClick={() => onDelete(data.id)} onMouseEnter={() => onDeleteHover(data.id)} onMouseLeave={onDeleteLeave} title="Delete this node">
                <LuTrash2 />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const WhyNode = ({ data }: any) => {
  const { node, handlers, isRoot, factorsData, readOnly } = data;
  return (
    <>
      {!isRoot && <Handle type="target" position={Position.Left} />}
      <NodeCard data={node} isRoot={isRoot} factorsData={factorsData} readOnly={readOnly} {...handlers} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};

function findDepth(rootNode: WhyNodeData, targetId: string, depth = 0): number {
  if (rootNode.id === targetId) return depth;
  for (const child of rootNode.children) {
    const foundDepth = findDepth(child, targetId, depth + 1);
    if (foundDepth !== -1) return foundDepth;
  }
  return -1;
}
function updateNode(node: WhyNodeData, id: string, updates: Partial<WhyNodeData>): WhyNodeData {
  if (node.id === id) return { ...node, ...updates };
  return {
    ...node,
    children: node.children.map((c) => updateNode(c, id, updates)),
  };
}
function updateMultipleNodes(node: WhyNodeData, ids: string[], updates: Partial<WhyNodeData>): WhyNodeData {
  let updatedNode = { ...node };
  if (ids.includes(node.id)) {
    updatedNode = { ...updatedNode, ...updates };
  }
  updatedNode.children = node.children.map((child) => updateMultipleNodes(child, ids, updates));
  return updatedNode;
}
function removeNode(node: WhyNodeData, id: string): WhyNodeData {
  return {
    ...node,
    children: node.children.filter((c) => c.id !== id).map((c) => removeNode(c, id)),
  };
}
function addChild(currentNode: WhyNodeData, parentId: string, newChild: WhyNodeData, rootNode: WhyNodeData): WhyNodeData {
  if (currentNode.id === parentId) {
    const depth = findDepth(rootNode, parentId);
    if (currentNode.children.length >= 5) {
      console.warn('Max children (5) reached for node:', parentId);
      return currentNode;
    }
    if (depth >= 4) {
      console.warn('Max depth (5) reached for node:', parentId);
      return currentNode;
    }
    return { ...currentNode, children: [...currentNode.children, newChild] };
  }
  return {
    ...currentNode,
    children: currentNode.children.map((c) => addChild(c, parentId, newChild, rootNode)),
  };
}
function findNode(node: WhyNodeData, id: string): WhyNodeData | null {
  if (node.id === id) return node;
  for (const c of node.children) {
    const found = findNode(c, id);
    if (found) return found;
  }
  return null;
}
function toFlowData(node: WhyNodeData, data: { nodes: Node[]; edges: Edge[] } = { nodes: [], edges: [] }): { nodes: Node[]; edges: Edge[] } {
  data.nodes.push({
    id: node.id,
    position: { x: 0, y: 0 },
    data: {},
    type: 'whyNode',
  });
  node.children.forEach((child) => {
    data.edges.push({
      id: `${node.id}-${child.id}`,
      source: node.id,
      target: child.id,
      type: 'smoothstep',
      animated: false,
      style: { stroke: 'var(--accent-color)', strokeWidth: 2 },
    });
    toFlowData(child, data);
  });
  return data;
}

function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'LR') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 120 });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 280, height: 220 });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 140,
      y: nodeWithPosition.y - 110,
    };
    return node;
  });
  return { nodes: layoutedNodes, edges };
}
const getBoundsOfNodes = (nodes: Node[], nodeWidth: number, nodeHeight: number) => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });
  const padding = 50;
  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
};



// --- Main Component ---
const WhyWhyAnalysis: React.FC<WhyWhyAnalysisProps> = ({ initialData, incidentId = '', onTreeChange, onSubmit, readOnly = false, width = '100%', height = '100vh' }) => {
  const { user } = useSelector((state: RootState) => state.auth as { user: any });
  const [history, setHistory] = useState<WhyNodeData[]>([
    initialData || {
      id: 'root',
      label: '',
      status: 'new',
      isDiscarded: false,
      children: [],
    },
  ]);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [deleteHighlightIds, setDeleteHighlightIds] = useState<string[]>([]);
  const [factorsData, setFactorsData] = useState<FactorsData>({
    system: [],
    human: [],
    unsafeAct: [],
    unsafeCondition: [],
  });
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const token = useSelector(selectUserToken);
  const tree = history[currentStateIndex];

  useEffect(() => {
    const fetchFactors = async () => {
      try {
        if (!token) return;
        const api = axios.create({
          baseURL: INCIDENT_RCA_FACTOR,
          headers: { Authorization: `Bearer ${token}` },
        });
        const [systemRes, humanRes, unsafeActRes, unsafeConditionRes] = await Promise.all([
          api.get(`/get-factors/System/None`),
          api.get(`/get-factors/Human/None`),
          api.get(`/get-factors/Physical/UnsafeAct`),
          api.get(`/get-factors/Physical/UnsafeCondition`),
        ]);
        setFactorsData({
          system: systemRes.data.map((item: any) => ({
            id: item.id,
            label: item.systemFactor,
          })),
          human: humanRes.data.map((item: any) => ({
            id: item.id,
            label: item.humanFactor,
          })),
          unsafeAct: unsafeActRes.data.map((item: any) => ({
            id: item.id,
            label: item.unsafeAct,
          })),
          unsafeCondition: unsafeConditionRes.data.map((item: any) => ({
            id: item.id,
            label: item.unsafeCondition,
          })),
        });
      } catch (error) {
        console.error('Failed to fetch factors:', error);
      }
    };
    fetchFactors();
  }, [token]);
  const setTreeState = useCallback(
    (newTree: WhyNodeData) => {
      const newHistory = history.slice(0, currentStateIndex + 1);
      const updatedHistory = [...newHistory, newTree];
      setHistory(updatedHistory);
      setCurrentStateIndex(updatedHistory.length - 1);
      if (onTreeChange) {
        onTreeChange(newTree);
      }
    },
    [history, currentStateIndex, onTreeChange]
  );
  const onUpdate = useCallback(
    (id: string, updates: Partial<WhyNodeData>) => {
      setTreeState(updateNode(tree, id, updates));
    },
    [tree, setTreeState]
  );
 const onConclude = useCallback(
  (id: string) => {
    const node = findNode(tree, id);
    if (!node) return;
    
    // Toggle: if already concluded, un-conclude it; otherwise conclude it
    const newStatus = node.status === 'concluded' ? 'new' : 'concluded';
    setTreeState(updateNode(tree, id, { status: newStatus }));
  },
  [tree, setTreeState]
);

// Function to get all node IDs in concluded branches (from concluded node to root)
const getConcludedBranchNodeIds = (tree: WhyNodeData): Set<string> => {
  const branchNodeIds = new Set<string>();
  
  // Find all concluded nodes
  const findConcludedNodes = (node: WhyNodeData) => {
    if (node.status === 'concluded') {
      // Get path from this concluded node to root
      const pathIds = getPathToRoot(node.id, tree);
      pathIds.forEach(id => branchNodeIds.add(id));
    }
    node.children.forEach(findConcludedNodes);
  };
  
  findConcludedNodes(tree);
  return branchNodeIds;
};

const validateTree = useCallback((node: WhyNodeData, isRoot: boolean = false): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate root node
  if (isRoot) {
    if (!node.label || node.label.trim() === '') {
      errors.push('Please define the problem in the root node');
    }
  }
  
  // Validate non-root nodes
  if (!isRoot) {
    if (!node.label || node.label.trim() === '') {
      errors.push('Please fill "Why did that happen?" for all nodes');
    }
    
    if (!node.factor || node.factor === '') {
      errors.push('Please choose a factor for all nodes');
    }
    
    if (node.factor && (!node.subFactor || node.subFactor === '')) {
      errors.push('Please choose a sub-factor for all nodes');
    }
  }
  
  // Recursively validate children
  node.children.forEach(child => {
    const childValidation = validateTree(child, false);
    errors.push(...childValidation.errors);
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}, []);

  const handleSubmit = useCallback(async () => {
    if (!incidentId) {
      console.error('Incident ID is required for submission');
      return;
    }

    const effectiveIncidentId = incidentId;

      if (!effectiveIncidentId) {
    console.error('Incident ID is required for submission');
    toast.error('Incident ID is required for submission');
    return;
  }

   const validation = validateTree(tree, true);
  
  if (!validation.isValid) {
    // Show unique error messages
    const uniqueErrors = [...new Set(validation.errors)];
    uniqueErrors.forEach(error => {
      toast.error(error);
    });
    return;
  }

   if (tree.children.length === 0) {
    toast.error('Please add at least one cause to the analysis');
    return;
  }
  setIsSubmitting(true); // Start loading

 try {
    const whyAnalyses = processTreeToPayload(tree, null, effectiveIncidentId, 1);
    console.log("Why Why Payload:", whyAnalyses);

    // Generate PNG file
    const imageFile = await generateImageFile();
    
    if (onSubmit) {
      await onSubmit(whyAnalyses, imageFile);
    }
  } catch (error) {
    console.error('Error submitting analysis:', error);
    toast.error('Error submitting analysis');
  } finally {
    setIsSubmitting(false); // Stop loading
  }
  }, [tree, incidentId, onSubmit]);

  
  
  const onDelete = useCallback(
    (id: string) => {
      setTreeState(removeNode(tree, id));
    },
    [tree, setTreeState]
  );


  const onAddChild = useCallback(
    (id: string) => {
      const newChildData: WhyNodeData = {
        id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        label: '',
        status: 'new' as NodeStatus,
        isDiscarded: false,
        children: [],
      };
      const newTree = addChild(tree, id, newChildData, tree);
      setTreeState(newTree);
    },
    [tree, setTreeState]
  );

  const getAllDescendantIds = useCallback((startNodeId: string, currentTree: WhyNodeData): string[] => {
    const descendants: string[] = [];
    const findDescendants = (node: WhyNodeData) => {
      node.children.forEach((child) => {
        descendants.push(child.id);
        findDescendants(child);
      });
    };
    const startNode = findNode(currentTree, startNodeId);
    if (startNode) findDescendants(startNode);
    return descendants;
  }, []);

  // Function to get all ancestor IDs from a node to root
const getPathToRoot = (nodeId: string, tree: WhyNodeData): string[] => {
  const path: string[] = [];
  
  const findPath = (currentNode: WhyNodeData, targetId: string): boolean => {
    if (currentNode.id === targetId) {
      path.push(currentNode.id);
      return true;
    }
    
    for (const child of currentNode.children) {
      if (findPath(child, targetId)) {
        path.push(currentNode.id);
        return true;
      }
    }
    return false;
  };
  
  findPath(tree, nodeId);
  return path;
};

// Function to get all edges from a discarded node to its descendants
const getDiscardedPaths = (tree: WhyNodeData): Set<string> => {
  const discardedEdges = new Set<string>();
  
  const findDiscardedPaths = (node: WhyNodeData) => {
    // If this node is discarded, mark all edges to children as red
    if (node.isDiscarded) {
      node.children.forEach(child => {
        discardedEdges.add(`${node.id}-${child.id}`);
        // Recursively add all descendant edges
        addAllDescendantEdges(child, discardedEdges);
      });
    }
    
    // Continue checking children
    node.children.forEach(findDiscardedPaths);
  };
  
  const addAllDescendantEdges = (node: WhyNodeData, edges: Set<string>) => {
    node.children.forEach(child => {
      edges.add(`${node.id}-${child.id}`);
      addAllDescendantEdges(child, edges);
    });
  };
  
  findDiscardedPaths(tree);
  return discardedEdges;
};


  const onDiscardBranch = useCallback(
  (nodeId: string) => {
    const node = findNode(tree, nodeId);
    if (!node) return;
    
    const descendantIds = getAllDescendantIds(nodeId, tree);
    const allIdsToMark = [nodeId, ...descendantIds];
    
    // Toggle: if already discarded, un-discard it; otherwise discard it
    const newTree = updateMultipleNodes(tree, allIdsToMark, {
      isDiscarded: !node.isDiscarded, // Toggle the state
    });
    setTreeState(newTree);
  },
  [tree, getAllDescendantIds, setTreeState]
);
  const hoverHighlightRef = useRef<Set<string>>(new Set());

const onDeleteHover = (nodeId: string) => {
  const ids = [nodeId, ...getAllDescendantIds(nodeId, tree)];
  hoverHighlightRef.current = new Set(ids);
};

  const onDeleteLeave = useCallback(() => {
    hoverHighlightRef.current.clear();
  }, []);
  
  const clearAllNodes = useCallback(() => {
    const clearedTree = { ...tree, children: [] };
    setTreeState(clearedTree);
  }, [tree, setTreeState]);
  const handleUndo = useCallback(() => {
    if (currentStateIndex > 0) {
      setCurrentStateIndex(currentStateIndex - 1);
      if (onTreeChange) {
        onTreeChange(history[currentStateIndex - 1]);
      }
    }
  }, [currentStateIndex, history, onTreeChange]);
  
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
  const { nodes, edges } = toFlowData(tree);
  const { nodes: finalNodes, edges: finalEdges } = getLayoutedElements(nodes, edges);
  return { nodes: finalNodes, edges: finalEdges };
}, [tree]);

const flowEdges = useMemo(() => {
  // Get all concluded node IDs
  const concludedNodeIds = new Set<string>();
  const findConcludedNodes = (node: WhyNodeData) => {
    if (node.status === 'concluded') {
      concludedNodeIds.add(node.id);
    }
    node.children.forEach(findConcludedNodes);
  };
  findConcludedNodes(tree);
  
  // Get all paths to root from concluded nodes (BLUE)
  const bluePaths = new Set<string>();
  concludedNodeIds.forEach(nodeId => {
    const pathIds = getPathToRoot(nodeId, tree);
    pathIds.forEach((id, index) => {
      if (index < pathIds.length - 1) {
        bluePaths.add(`${pathIds[index + 1]}-${id}`);
      }
    });
  });
  
  // Get all discarded paths (RED)
  const redPaths = getDiscardedPaths(tree);
  
  // Apply colors to edges (RED takes priority over BLUE)
  return layoutedEdges.map(edge => {
    if (redPaths.has(edge.id)) {
      return {
        ...edge,
        style: { stroke: '#ef4444', strokeWidth: 3 }, // Red color
        animated: false
      };
    } else if (bluePaths.has(edge.id)) {
      return {
        ...edge,
        style: { stroke: '#08ab44', strokeWidth: 3 }, // Blue color
        animated: false
      };
    } else {
      return {
        ...edge,
        style: { stroke: 'var(--accent-color)', strokeWidth: 2 },
        animated: false
      };
    }
  });
}, [tree, layoutedEdges]);
  


  const handleDownloadImage = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) {
      console.error('React Flow viewport not found for image generation.');
      return;
    }

    const nodeBounds = getBoundsOfNodes(layoutedNodes, 280, 220);

    toPng(viewport, {
      backgroundColor: '#e0e7ff',
      width: nodeBounds.width,
      height: nodeBounds.height,
      style: {
        width: `${nodeBounds.width}px`,
        height: `${nodeBounds.height}px`,
        transform: `translate(${-nodeBounds.x}px, ${-nodeBounds.y}px)`,
      },
      cacheBust: true,
      skipAutoScale: true,
      pixelRatio: 2,
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'why-why-analysis.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Image generation failed!', err);
      });
  }, [layoutedNodes]);

  const generateImageFile = useCallback(async (): Promise<File | null> => {
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewport) {
    console.error('React Flow viewport not found for image generation.');
    return null;
  }

  const nodeBounds = getBoundsOfNodes(layoutedNodes, 280, 220);

  try {

      await new Promise(resolve => setTimeout(resolve, 300));
      const dataUrl = await toPng(viewport, {
      backgroundColor: '#e0e7ff',
      width: nodeBounds.width,
      height: nodeBounds.height,
      style: {
        width: `${nodeBounds.width}px`,
        height: `${nodeBounds.height}px`,
        transform: `translate(${-nodeBounds.x}px, ${-nodeBounds.y}px)`,
      },
      cacheBust: true,
      skipAutoScale: true,
      pixelRatio: 2,
    });

    // Convert dataUrl to File
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'why.png', { type: 'image/png' });
    return file;
  } catch (err) {
    console.error('Image generation failed!', err);
    return null;
  }
}, [layoutedNodes]);
  

  const handlers = useMemo(
    () => ({
      onUpdate: readOnly ? () => { } : onUpdate,
      onConclude: readOnly ? () => { } : onConclude,
      onDelete: readOnly ? () => { } : onDelete,
      onAddChild: readOnly ? () => { } : onAddChild,
      onDeleteHover: readOnly ? () => { } : onDeleteHover,
      onDeleteLeave: readOnly ? () => { } : onDeleteLeave,
      onDiscardBranch: readOnly ? () => { } : onDiscardBranch,
    }),
    [onUpdate, onConclude, onDelete, onAddChild, onDeleteHover, onDeleteLeave, onDiscardBranch, readOnly]
  );
  const flowNodes = useMemo(
    () =>
      layoutedNodes.map((n) => {
        const nodeData = findNode(tree, n.id)!;
        const classNames = [];
        if (deleteHighlightIds.includes(n.id)) classNames.push('discard-hover');
        if (nodeData.isDiscarded) classNames.push('is-discarded');
         const concludedBranchIds = getConcludedBranchNodeIds(tree);
      if (concludedBranchIds.has(n.id) && n.id !== 'root') {
        classNames.push('concluded-branch');
      }
        return {
          ...n,
          className: classNames.join(' '),
          type: 'whyNode',
          data: {
            node: nodeData,
            handlers,
            isRoot: n.id === 'root',
            factorsData,
            readOnly,
          },
        };
      }),
    [layoutedNodes, tree, factorsData, deleteHighlightIds, handlers, readOnly]
  );
  const nodeTypes = useMemo(() => ({ whyNode: WhyNode }), []);
  const getUserInfo = () => ({ userId: user?.createdBy });

  // FIXED: Transform node to payload with proper questionId/questionRefId handling
  const transformNodeToPayload = (
    node: WhyNodeData,
    parentNode: WhyNodeData | null,
    incidentId: string,
    level: number,
    questionId: string
  ): WhyAnalysisPayload => {
    const { userId } = getUserInfo();
    const now = new Date().toISOString();
    const isConclusive = node.status === 'concluded' && node.children.length === 0;

    let factorType = '';
    let physicalFactorType: string | null = null;
    const factorDetail = node.subFactor || '';

    if (node.factor) {
      switch (node.factor) {
        case 'System Factor':
          factorType = 'System Factor';
          break;
        case 'Human Factor':
          factorType = 'Human Factor';
          break;
        case 'Unsafe Act':
          factorType = 'Physical Factor';
          physicalFactorType = 'Unsafe Acts';
          break;
        case 'Unsafe Condition':
          factorType = 'Physical Factor';
          physicalFactorType = 'Unsafe Conditions';
          break;
        default:
          factorType = node.factor;
      }
    }

    const status = node.isDiscarded ? 'Discarded' : '';

    const whyQuestion = parentNode && parentNode.id !== 'root' ? parentNode.label : (parentNode ? parentNode.label : 'Root Incident');
    
    // FIXED: Use parent's questionId as questionRefId (not parent's node id)
    const questionRefId = parentNode 
      ? (parentNode.id === 'root' ? '0' : (parentNode.questionId || parentNode.id)) 
      : '0';

    return {
      whyQuestion: whyQuestion,
      whyAnswer: node.label,
      whyConclusive: isConclusive ? 'Yes' : 'No',
      whyConclusion: '',
      pirId: incidentId,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId,
      questionId: questionId,
      questionRefId: questionRefId,
      levelNo: level.toString(),
      factorType: factorType,
      status: status,
      factorDetail: factorDetail,
      prevRefId: null,
      factorDetailType: null,
      physicalFactorType: physicalFactorType,
    };
  };
const [isSubmitting, setIsSubmitting] = useState(false);
const [hover, setHover] = useState(false);

  // FIXED: Process tree to payload with proper questionId assignment
  const processTreeToPayload = (
    node: WhyNodeData,
    parent: WhyNodeData | null,
    incidentId: string,
    level: number,
    results: WhyAnalysisPayload[] = [],
    questionCounter: { count: number } = { count: 1 }
  ): WhyAnalysisPayload[] => {

    if (parent === null) {
      // Root node - process children
      node.children.forEach((child) => {
        processTreeToPayload(child, node, incidentId, level, results, questionCounter);
      });
    } else {
      // Generate questionId for this node
      const currentQuestionId = questionCounter.count.toString();
      
      // FIXED: Store the questionId in the node for children to reference
      node.questionId = currentQuestionId;
      
      const payload = transformNodeToPayload(node, parent, incidentId, level, currentQuestionId);
      results.push(payload);
      questionCounter.count++;
      
      // Process children with updated node that has questionId
      node.children.forEach((child) => {
        processTreeToPayload(child, node, incidentId, level + 1, results, questionCounter);
      });
    }
    return results;
  };

  return (
    <div className="why-why-container" style={{ width, height }}>
      <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} fitView fitViewOptions={{ minZoom: 0.5 }} nodesDraggable={false} className="react-flow">
        <Panel position='top-left'> {!readOnly && (<> <button type="button" onClick={clearAllNodes} className="panel-button">
                Clear All
              </button></>)}
                <button type="button" onClick={handleUndo} className="panel-button" disabled={currentStateIndex === 0}>
            Undo
          </button></Panel>
        <Panel position="top-right">
          <button type="button" onClick={handleDownloadImage} className="panel-button">
            Download File
          </button>
          {!readOnly && (
            <>
             
            <button 
  type="button" 
  onClick={handleSubmit} 
  className="panel-button" 
  style={{
    backgroundColor: hover ? '#2dc86dff' : '#08ab44',
    color: '#fff'
  }}  
  onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
  disabled={!incidentId || isSubmitting}
>
  {isSubmitting ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Submitting...
    </>
  ) : (
    'Submit Analysis'
  )}
</button>
            </>
          )}
        
        </Panel>
        <Background variant={BackgroundVariant.Dots} gap={15} size={1} color="#94a3b8" />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </div>
  );
};

export default WhyWhyAnalysis;