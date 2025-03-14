import { Badge, Stack, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";

type Field<T> = {
  [K in keyof T]: {
    accessor: K;
    label: string;
    render: (value: T[K]) => ReactNode;
  };
}[keyof T];

interface Props<T> {
  oldObject: T | null;
  newObject: T;
  fields: Field<T>[];
}

export const ChangeList = <T,>({ oldObject, newObject, fields }: Props<T>) => {
  const changedFields = fields.filter(
    (field) => !oldObject || oldObject[field.accessor] !== newObject[field.accessor],
  );

  return (
    <Stack>
      {oldObject === null ? (
        <Text fontSize="md" fontWeight="bold">
          New Fields
        </Text>
      ) : (
        <Text fontSize="md" fontWeight="bold">
          Updated Fields
        </Text>
      )}
      {changedFields.length === 0 ? (
        <Text fontSize="md" textAlign="center">
          None.
        </Text>
      ) : (
        changedFields.map((field) => (
          <Stack key={field.label} spacing="1">
            <Text fontSize="xs" fontWeight="bold" color="gray.600">
              {field.label}
            </Text>
            <Stack direction="row" align="center" spacing="1">
              {oldObject && (
                <>
                  <Text fontSize="md">
                    {field.render(oldObject[field.accessor]) === null ||
                    field.render(oldObject[field.accessor]) === "" ? (
                      <Badge>Unset</Badge>
                    ) : (
                      field.render(oldObject[field.accessor])
                    )}
                  </Text>
                  <FiArrowRight />
                </>
              )}
              <Text fontSize="md">
                {field.render(newObject[field.accessor]) === null ||
                field.render(newObject[field.accessor]) === "" ? (
                  <Badge>Unset</Badge>
                ) : (
                  field.render(newObject[field.accessor])
                )}
              </Text>
            </Stack>
          </Stack>
        ))
      )}
    </Stack>
  );
};
