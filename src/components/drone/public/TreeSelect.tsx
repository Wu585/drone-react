import {useState, forwardRef, useMemo} from "react";
import {ChevronDown, ChevronUp} from "lucide-react";
import {cn} from "@/lib/utils";
import {CommonPopover} from "./CommonPopover";
import {TreeNode, TreeRender} from "@/components/drone/public/TreeRender.tsx";

interface TreeSelectProps {
  value?: string | number | null;
  onChange?: (id: string | number | null) => void;
  treeData: TreeNode[];
  placeholder?: string;
  className?: string;
  popoverClassName?: string;
  onExpand?: (node: TreeNode) => Promise<void> | void;
  defaultExpandedIds?: (string | number)[];
  renderSelected?: (node: TreeNode | null) => React.ReactNode;
  renderItem?: (node: TreeNode) => React.ReactNode;
}

const TreeSelect = forwardRef<HTMLButtonElement, TreeSelectProps>(
  (
    {
      value,
      onChange,
      treeData,
      placeholder = "请选择...",
      className,
      popoverClassName,
      onExpand,
      defaultExpandedIds = [],
      renderSelected,
      renderItem
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);

    // Find the selected node by id
    const selectedNode = useMemo(() => {
      if (value === null || value === undefined) return null;

      const findNode = (nodes: TreeNode[]): TreeNode | null => {
        for (const node of nodes) {
          if (node.id === value) return node;
          if (node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      return findNode(treeData);
    }, [value, treeData]);

    const handleSelect = (node: TreeNode) => {
      onChange?.(node.id);
      setOpen(false);
    };

    return (
      <CommonPopover
        modal={true}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <div className="flex items-center justify-between w-full">
            {selectedNode ? (
              renderSelected ? (
                renderSelected(selectedNode)
              ) : (
                <span className="truncate">{selectedNode.name}</span>
              )
            ) : (
              <span className="text-[#d0d0d0]">{placeholder}</span>
            )}
            {open ? (
              <ChevronUp className="h-4 w-4 ml-2 opacity-50"/>
            ) : (
              <ChevronDown className="h-4 w-4 ml-2 opacity-50"/>
            )}
          </div>
        }
        className={cn("w-full justify-between", className)}
        contentClassName={cn("w-[var(--radix-popover-trigger-width)]", popoverClassName)}
        ref={ref}
      >
        <TreeRender
          data={treeData}
          selectedId={value}
          onSelect={handleSelect}
          onExpand={onExpand}
          defaultExpandedIds={defaultExpandedIds}
          renderItem={renderItem}
        />
      </CommonPopover>
    );
  }
);

TreeSelect.displayName = "TreeSelect";

export {TreeSelect};
