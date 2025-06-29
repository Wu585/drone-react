import {ChevronRight} from "lucide-react";
import {cn} from "@/lib/utils";
import {useState} from "react";

export interface TreeNode {
  id: string | number;
  name: string;
  children?: TreeNode[];
  isLeaf?: boolean;

  [key: string]: any; // Allow additional properties
}

export interface TreeSelectProps {
  data: TreeNode[];
  selectedId?: string | number | null;
  onSelect?: (node: TreeNode) => void;
  onExpand?: (node: TreeNode) => Promise<void> | void;
  className?: string;
  itemClassName?: string;
  selectedItemClassName?: string;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  leafIcon?: React.ReactNode;
  parentIcon?: React.ReactNode;
  expandedParentIcon?: React.ReactNode;
  renderItem?: (node: TreeNode) => React.ReactNode;
  defaultExpandedIds?: (string | number)[];
  indentWidth?: number;
}

const TreeItem = ({
                    node,
                    depth = 0,
                    selectedId,
                    onSelect,
                    onExpand,
                    expandIcon = <ChevronRight className="h-3 w-3"/>,
                    collapseIcon = <ChevronRight className="h-3 w-3 rotate-90"/>,
                    leafIcon = <div className="w-3"/>,
                    parentIcon = <div className="h-3 w-3 text-[#2D5FAC]"/>,
                    expandedParentIcon = <div className="h-3 w-3 text-[#2D5FAC]"/>,
                    renderItem,
                    itemClassName = "flex items-center h-8 cursor-pointer hover:bg-[#2D5FAC]/[.3] text-sm text-white",
                    selectedItemClassName = "bg-[#2D5FAC]/[.5]",
                    indentWidth = 16,
                    defaultExpandedIds = [],
                  }: {
  node: TreeNode;
  depth?: number;
  selectedId?: string | number | null;
  onSelect?: (node: TreeNode) => void;
  onExpand?: (node: TreeNode) => Promise<void> | void;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  leafIcon?: React.ReactNode;
  parentIcon?: React.ReactNode;
  expandedParentIcon?: React.ReactNode;
  renderItem?: (node: TreeNode) => React.ReactNode;
  itemClassName?: string;
  selectedItemClassName?: string;
  indentWidth?: number;
  defaultExpandedIds?: (string | number)[];
}) => {
  const [expanded, setExpanded] = useState(defaultExpandedIds.includes(node.id));
  const [loading, setLoading] = useState(false);

  // Determine if node is a leaf (no children or empty children array)
  const isLeaf = node.isLeaf || (node.children && node.children.length === 0);
  const hasChildren = !isLeaf && (node.children?.length || !node.isLeaf);

  const handleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpand && !expanded && !node.children?.length && !node.isLeaf) {
      setLoading(true);
      try {
        await onExpand(node);
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleSelect = () => {
    onSelect?.(node);
  };

  return (
    <div>
      <div
        className={cn(
          itemClassName,
          selectedId === node.id && selectedItemClassName
        )}
        style={{paddingLeft: `${depth * indentWidth}px`}}
        onClick={handleSelect}
      >
        <div className="w-5 flex items-center justify-center shrink-0">
          {hasChildren ? (
            <span
              onClick={handleExpand}
              className={cn(
                "transition-transform",
                loading ? "opacity-50" : "cursor-pointer"
              )}
            >
              {expanded ? collapseIcon : expandIcon}
            </span>
          ) : (
            leafIcon
          )}
        </div>

        <div className="w-5 flex items-center justify-center shrink-0">
          {hasChildren
            ? (expanded ? expandedParentIcon : parentIcon)
            : leafIcon}
        </div>

        {renderItem ? (
          renderItem(node)
        ) : (
          <span className="truncate">{node.name}</span>
        )}
      </div>

      {expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onExpand={onExpand}
              expandIcon={expandIcon}
              collapseIcon={collapseIcon}
              leafIcon={leafIcon}
              parentIcon={parentIcon}
              expandedParentIcon={expandedParentIcon}
              renderItem={renderItem}
              itemClassName={itemClassName}
              selectedItemClassName={selectedItemClassName}
              indentWidth={indentWidth}
              defaultExpandedIds={defaultExpandedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeRender = ({
                             data,
                             selectedId,
                             onSelect,
                             onExpand,
                             className,
                             itemClassName,
                             selectedItemClassName,
                             expandIcon,
                             collapseIcon,
                             leafIcon,
                             parentIcon,
                             expandedParentIcon,
                             renderItem,
                             defaultExpandedIds = [],
                             indentWidth = 16,
                           }: TreeSelectProps) => {
  return (
    <div className={cn(
      "bg-[#1E3762]/[.7] border-[1px] border-[#2D5FAC]/[.85] rounded-[2px] p-1 max-h-[300px] overflow-auto",
      className
    )}
    >
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          onExpand={onExpand}
          expandIcon={expandIcon}
          collapseIcon={collapseIcon}
          leafIcon={leafIcon}
          parentIcon={parentIcon}
          expandedParentIcon={expandedParentIcon}
          renderItem={renderItem}
          itemClassName={itemClassName}
          selectedItemClassName={selectedItemClassName}
          indentWidth={indentWidth}
          defaultExpandedIds={defaultExpandedIds}
        />
      ))}
    </div>
  );
};
