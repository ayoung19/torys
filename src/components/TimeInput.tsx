import {
  FormControl,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
} from "@chakra-ui/react";
import { TZDate } from "@date-fns/tz";
import { useDisclosure, useId } from "@mantine/hooks";
import { format } from "date-fns";
import fuzzysort from "fuzzysort";
import { useCallback, useEffect, useRef, useState } from "react";

const OPTIONS = [...Array(Math.floor(86400 / 900))]
  .map((_, i) => i * 900)
  .map((s) => ({ label: format(TZDate.tz("+00:00", s * 1000), "hh:mmaaa"), value: s }));

interface Props {
  label?: string;
  value: string;
  onChange: (newValue: string) => void;
}

export const TimeInput = ({ label, value, onChange }: Props) => {
  const id = useId();

  const valueToLabel = useCallback(
    (value: string) => OPTIONS.find((option) => option.value.toString() === value)?.label || value,
    [],
  );

  const [opened, handlers] = useDisclosure();
  const [query, setQuery] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const options = fuzzysort
    .go(query, OPTIONS, { key: "label", all: true })
    .map(({ obj }) => obj)
    .sort((a, b) => a.value - b.value);

  useEffect(() => {
    if (opened) {
      setQuery("");

      setTimeout(() => {
        inputRef.current?.focus();
        document.querySelector(`.${id}-${value}`)?.scrollIntoView();
      }, 50);
    }
  }, [opened]);

  return (
    <Menu isOpen={opened} onClose={handlers.close}>
      <Stack spacing={0}>
        <FormControl>
          {label && <FormLabel>{label}</FormLabel>}
          <Input
            ref={inputRef}
            onFocus={handlers.open}
            onClick={handlers.open}
            value={opened ? query : valueToLabel(value)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="hh:mm"
          />
        </FormControl>
        <MenuButton />
      </Stack>
      <MenuList maxH="200px" overflowY="auto">
        {options.map(({ label, value }) => (
          <MenuItem
            key={value}
            className={`${id}-${value}`}
            onClick={() => onChange(value.toString())}
          >
            {label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
