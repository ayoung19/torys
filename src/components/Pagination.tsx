import { IconButton, Stack, Text } from "@chakra-ui/react";
import { usePagination } from "@mantine/hooks";
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from "react-icons/fi";

interface Props {
  pagination: ReturnType<typeof usePagination>;
}

export const Pagination = ({ pagination }: Props) => {
  return (
    <Stack direction="row">
      <IconButton
        aria-label="Paginate previous"
        icon={<FiChevronLeft />}
        isDisabled={pagination.range.length === 0 || pagination.active === pagination.range[0]}
        onClick={() => pagination.previous()}
      />
      {pagination.range.map((n, i) =>
        n === "dots" ? (
          <Stack key={i} alignItems="center" justifyContent="center" w="8" h="8">
            <FiMoreHorizontal />
          </Stack>
        ) : (
          <IconButton
            key={i}
            colorScheme={pagination.active === n ? "purple" : undefined}
            aria-label={`Paginate page ${n}`}
            icon={<Text fontSize="xs">{n}</Text>}
            onClick={() => pagination.setPage(n)}
          />
        ),
      )}
      <IconButton
        aria-label="Paginate next"
        icon={<FiChevronRight />}
        isDisabled={
          pagination.range.length === 0 ||
          pagination.active === pagination.range[pagination.range.length - 1]
        }
        onClick={() => pagination.next()}
      />
    </Stack>
  );
};
