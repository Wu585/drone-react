import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {cn} from "@/lib/utils.ts";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  className?: string;
  disabled?: boolean;
}

export function CommonPagination({
                                   currentPage,
                                   totalPages,
                                   onPageChange,
                                   maxVisiblePages = 5,
                                   className = "",
                                   disabled = false,
                                 }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({length: totalPages}, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = maxVisiblePages;
    } else if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxVisiblePages + 1;
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (!disabled) {
      onPageChange(page);
    }
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1 && !disabled) handlePageChange(currentPage - 1);
            }}
            aria-disabled={currentPage <= 1 || disabled}
            className={cn(
              "hover:bg-transparent text-[#d0d0d0] hover:text-[#d0d0d0] border-[1px] border-[#d0d0d0]", 
              (currentPage <= 1 || disabled) ? "opacity-50 cursor-not-allowed" : ""
            )}
          />
        </PaginationItem>

        {visiblePages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                className={"hover:bg-transparent text-[#d0d0d0] hover:text-[#d0d0d0]"}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(1);
                }}
                isActive={currentPage === 1}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {visiblePages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis/>
              </PaginationItem>
            )}
          </>
        )}

        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              className={cn("hover:bg-transparent text-[#d0d0d0] hover:text-[#d0d0d0]", page === currentPage ? "bg-transparent border-[1px] border-[#64D5FF] text-[#64D5FF]" : "")}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page);
              }}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis/>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                className={"hover:bg-transparent text-[#d0d0d0] hover:text-[#d0d0d0]"}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(totalPages);
                }}
                isActive={currentPage === totalPages}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages && !disabled) handlePageChange(currentPage + 1);
            }}
            aria-disabled={currentPage >= totalPages || disabled}
            className={cn(
              "hover:bg-transparent text-[#d0d0d0] hover:text-[#d0d0d0] border-[1px] border-[#d0d0d0]", 
              (currentPage >= totalPages || disabled) ? "opacity-50 cursor-not-allowed" : ""
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
