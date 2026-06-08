// "use client"
// import ProtectedRoute from '@/components/ProtectedRoute';
// import { useCallback } from 'react';
// import ReactFlow, {
//   MiniMap,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   addEdge,
// } from 'reactflow';

// import 'reactflow/dist/style.css';

// const initialNodes = [
//   { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
//   { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
// ];

// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

// function Flow() {
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

//   const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

//   return (
//     <div style={{height: "400px", width: "600px"}}>
//     <ReactFlow
//       nodes={nodes}
//       edges={edges}
//       onNodesChange={onNodesChange}
//       onEdgesChange={onEdgesChange}
//       onConnect={onConnect}
//     >
//       <MiniMap />
//       <Controls />
//       <Background />
//     </ReactFlow>
//     </div>
//   );
// }
// export default ProtectedRoute(Flow);
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';

interface NodeContent {
  input: string;
  select1: string;
  select2: string;
}

interface NodeData {
  id: string;
  type: 'horizontal' | 'vertical';
  content: NodeContent;
  children: NodeData[];
}

const initialNodes: NodeData[] = [
  {
    id: '1',
    type: 'horizontal',
    content: {
      input: 'Initial Node',
      select1: 'option1',
      select2: 'optionA'
    },
    children: []
  }
];

const CustomNode = ({ data, updateNodeContent }: { 
  data: NodeData;
  updateNodeContent: (id: string, content: NodeContent) => void;
}) => {
  const [lastAddedType, setLastAddedType] = useState<'horizontal' | 'vertical'>('horizontal');
  const [content, setContent] = useState<NodeContent>(data.content);

  const handleContentChange = (field: keyof NodeContent, value: string) => {
    const newContent = { ...content, [field]: value };
    setContent(newContent);
    updateNodeContent(data.id, newContent);
  };

  const handleAddNode = () => {
    const newType = lastAddedType === 'horizontal' ? 'vertical' : 'horizontal';
    // This would call a function passed from parent to add new node
    // addNewNode(data.id, newType);
    setLastAddedType(newType);
  };

  return (
    <div className="custom-node">
      <div className="node-header">
        <input
          value={content.input}
          onChange={(e) => handleContentChange('input', e.target.value)}
          placeholder="Enter text"
        />
      </div>
      <div className="node-body">
        <select
          value={content.select1}
          onChange={(e) => handleContentChange('select1', e.target.value)}
        >
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
        <select
          value={content.select2}
          onChange={(e) => handleContentChange('select2', e.target.value)}
        >
          <option value="optionA">Option A</option>
          <option value="optionB">Option B</option>
        </select>
      </div>
      <div className="node-actions">
        <button>Action 1</button>
        <button>Action 2</button>
        <button>Action 3</button>
      </div>
      <button className="add-node-btn" onClick={handleAddNode}>
        +
      </button>
    </div>
  );
};

const NodeEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeData, setNodeData] = useState<NodeData[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodeTypes = {
    custom: (props: any) => (
      <CustomNode 
        {...props} 
        updateNodeContent={updateNodeContent}
      />
    ),
  };

  const updateNodeContent = useCallback((id: string, content: NodeContent) => {
    setNodeData(prevData => {
      const updateContent = (nodes: NodeData[]): NodeData[] => {
        return nodes.map(node => {
          if (node.id === id) {
            return { ...node, content };
          }
          if (node.children.length > 0) {
            return { ...node, children: updateContent(node.children) };
          }
          return node;
        });
      };
      return updateContent(prevData);
    });
  }, []);

  const addNewNode = useCallback((parentId: string, type: 'horizontal' | 'vertical') => {
    const newNode: NodeData = {
      id: `${Date.now()}`,
      type,
      content: {
        input: '',
        select1: 'option1',
        select2: 'optionA'
      },
      children: []
    };

    setNodeData(prevData => {
      const updateNodeData = (nodes: NodeData[]): NodeData[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...node.children, newNode]
            };
          }
          if (node.children.length > 0) {
            return {
              ...node,
              children: updateNodeData(node.children)
            };
          }
          return node;
        });
      };
      return updateNodeData(prevData);
    });
  }, []);

  const formatNodes = useCallback((data: NodeData[], parentId?: string, level = 0): Node[] => {
    return data.flatMap((node, index) => {
      const reactFlowNode: Node = {
        id: node.id,
        type: 'custom',
        data: {
          ...node,
          addNewNode: (type: 'horizontal' | 'vertical') => addNewNode(node.id, type)
        },
        position: {
          x: node.type === 'horizontal' ? index * 250 : 0,
          y: node.type === 'vertical' ? level * 150 : 0
        },
        style: {
          width: 200,
          height: 'auto',
          border: '1px solid #ddd',
          padding: 10,
          borderRadius: 5,
          backgroundColor: '#fff'
        }
      };
      
      const childNodes = node.children.length > 0 
        ? formatNodes(node.children, node.id, level + 1) 
        : [];
      
      return [reactFlowNode, ...childNodes];
    });
  }, [addNewNode]);

  useEffect(() => {
    setNodes(formatNodes(nodeData));
  }, [nodeData, formatNodes, setNodes]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
      
      {/* Debug view of the data structure */}
      <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', padding: 10 }}>
        <pre>{JSON.stringify(nodeData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default NodeEditor;