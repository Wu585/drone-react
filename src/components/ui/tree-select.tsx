import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface TreeNode {
  id: number;
  name: string;
  parent: number;
  children?: TreeNode[];
}

interface TreeSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
  treeData: TreeNode[];
  className?: string;
}

export const TreeSelect = React.forwardRef<HTMLDivElement, TreeSelectProps>(
  ({ value, onChange, treeData, className }, ref) => {
    const [expandedNodes, setExpandedNodes] = React.useState<number[]>([]);

    const toggleNode = (nodeId: number) => {
      setExpandedNodes(prev => 
        prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    };

    const getNodeState = (node: TreeNode): "checked" | "unchecked" | "indeterminate" => {
      if (!node.children?.length) {
        return value.includes(node.id) ? "checked" : "unchecked";
      }

      const childIds = getAllChildIds(node);
      const selectedChildCount = childIds.filter(id => value.includes(id)).length;

      if (selectedChildCount === 0) return "unchecked";
      if (selectedChildCount === childIds.length) return "checked";
      return "indeterminate";
    };

    const renderTreeNode = (node: TreeNode, level: number = 0) => {
      const nodeState = getNodeState(node);
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes.includes(node.id);

      const handleChange = (checked: boolean) => {
        let newValue = [...value];
        if (checked) {
          if (!hasChildren) {
            newValue.push(node.id);
          } else {
            const childIds = getAllChildIds(node);
            newValue = [...newValue, ...childIds, node.id];
          }
        } else {
          newValue = newValue.filter(id => id !== node.id);
          if (hasChildren) {
            const childIds = getAllChildIds(node);
            newValue = newValue.filter(id => !childIds.includes(id));
          }
        }
        onChange(Array.from(new Set(newValue)));
      };

      return (
        <div key={node.id} className={cn("pl-6", level === 0 && "pl-0")}>
          <div className="flex items-center space-x-2 py-1">
            {hasChildren ? (
              <ChevronRight
                size={16}
                className={cn(
                  "cursor-pointer transition-transform",
                  isExpanded && "transform rotate-90"
                )}
                onClick={() => toggleNode(node.id)}
              />
            ) : (
              <div className="w-4"/>
            )}
            <Checkbox
              checked={nodeState === "checked"}
              className={cn(
                nodeState === "indeterminate" && "data-[state=checked]:bg-gray-400"
              )}
              data-state={nodeState === "indeterminate" ? "checked" : undefined}
              onCheckedChange={handleChange}
            />
            <span className="text-sm">{node.name}</span>
          </div>
          {hasChildren && isExpanded && (
            <div className="ml-4">
              {node.children?.map(child => renderTreeNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    const getAllChildIds = (node: TreeNode): number[] => {
      let ids: number[] = [];
      if (node.children) {
        node.children.forEach(child => {
          ids.push(child.id);
          if (child.children) {
            ids = [...ids, ...getAllChildIds(child)];
          }
        });
      }
      return ids;
    };

    return (
      <div ref={ref} className={cn("max-h-[300px] overflow-auto p-2", className)}>
        {treeData.map(node => renderTreeNode(node))}
      </div>
    );
  }
);

TreeSelect.displayName = "TreeSelect";
