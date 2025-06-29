import {ChevronRight, Folder, FolderOpen} from "lucide-react";
import {cn} from "@/lib/utils";
import {useState} from "react";
import {FileItem, useMediaList} from "@/hooks/drone";
import {MediaFileType} from "@/hooks/drone/media";
import {ELocalStorageKey} from "@/types/enum.ts";

interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[];
  level: number;
  hasChildren?: boolean;
}

function buildTree(data: FileItem[]): TreeNode[] {
  const nodeMap: { [key: number]: TreeNode } = {};
  const tree: TreeNode[] = [];

  // First, create a map of nodes
  data.forEach(item => {
    nodeMap[item.id] = {
      id: item.id,
      name: item.file_name,
      level: 0,
      hasChildren: false,
      children: []
    };
  });

  // Then, build the tree structure
  data.forEach(item => {
    const node = nodeMap[item.id];
    const parentId = item.parent;

    if (parentId === 0) {
      // This is a root node
      tree.push(node);
    } else {
      // This is a child node
      const parentNode = nodeMap[parentId];
      if (parentNode) {
        parentNode.children!.push(node);
        parentNode.hasChildren = true; // Mark that this parent has children
      }
    }
  });

  // Set levels for all nodes
  const setLevels = (nodes: TreeNode[], level: number) => {
    nodes.forEach(node => {
      node.level = level;
      if (node.children) {
        setLevels(node.children, level + 1);
      }
    });
  };

  setLevels(tree, 0); // Start with level 0 for root nodes

  return tree;
}

const TreeItem = ({
                    node,
                    selected,
                    onSelect,
                    onExpand
                  }: {
  node: TreeNode;
  selected: number;
  onSelect: (id: number) => void;
  onExpand?: (id: number) => Promise<void>;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        className={cn(
          "flex items-center h-9 cursor-pointer",
          "hover:bg-[#43ABFF]/10",
          selected === node.id && "bg-[#43ABFF]/20",
          "pl-" + (node.level * 6)
        )}
        onClick={() => onSelect(node.id)}
      >
        <div className="w-6 flex items-center justify-center shrink-0">
          {(node.children && node.children?.length > 0 || node.hasChildren) ? (
            <ChevronRight
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className={cn(
                "h-4 w-4 transition-transform text-white",
                expanded && "rotate-90"
              )}
            />
          ) : (
            <div className="w-4"/>
          )}
        </div>

        <div className="w-6 flex items-center justify-center shrink-0">
          {expanded ? (
            <FolderOpen className="h-4 w-4 text-orange-400"/>
          ) : (
            <Folder className="h-4 w-4 text-orange-400"/>
          )}
        </div>

        <span className="text-sm text-white truncate">{node.name}</span>
      </div>

      {expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              selected={selected}
              onSelect={onSelect}
              onExpand={onExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DirTree = ({onSelect}: { onSelect?: (id: number) => void }) => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const departId = localStorage.getItem("departId");
  const [selectedId, setSelectedId] = useState<number>(0);

  const [searchParams] = useState({
    page: 1,
    page_size: 1000,
    parent: -1,
    types: [MediaFileType.DIR],
    organ: departId ? departId : undefined,
  });

  const {data: mediaData} = useMediaList(workspaceId, searchParams);

  const treeData = buildTree(mediaData?.list || []);

  const _onSelect = (id: number) => {
    setSelectedId(id);
    onSelect?.(id);
  };

  return (
    <div className="h-[350px] overflow-y-auto">
      {treeData.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          selected={selectedId}
          onSelect={_onSelect}
        />
      ))}
    </div>
  );
};

export default DirTree;

