"use client";

import { ACCOUNT_TYPES_DEV_ADMIN } from "@/utils/account";
import { Badge, Heading, Stack } from "@chakra-ui/react";
import { UserButton } from "@clerk/nextjs";
import { Account, AccountType } from "@prisma/client";
import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarLink } from "@saas-ui/react";
import { usePathname } from "next/navigation";

interface Props {
  actor: Account;
}

export const SmartNavbar = ({ actor }: Props) => {
  const pathname = usePathname();

  return (
    <Navbar borderBottomWidth="1px">
      <NavbarBrand>
        <Stack direction="row" align="center">
          <Link href="/">
            <Heading size="md">Tory&apos;s Timesheet</Heading>
          </Link>
          {process.env.NODE_ENV === "development" && <Badge colorScheme="blue">Dev</Badge>}
        </Stack>
      </NavbarBrand>
      <NavbarContent>
        <NavbarItem>
          {/* Only dev or admins can access dashboard, employees, and accounts page. */}
          {ACCOUNT_TYPES_DEV_ADMIN.includes(actor.accountType) && (
            <>
              <NavbarLink isActive={pathname.includes("/dashboard")} href="/dashboard">
                Dashboard
              </NavbarLink>
              <NavbarLink isActive={pathname.includes("/employees")} href="/employees">
                Employees
              </NavbarLink>
              <NavbarLink isActive={pathname.includes("/accounts")} href="/accounts">
                Accounts
              </NavbarLink>
            </>
          )}
          {/* Foreman cannot access jobs page. */}
          {actor.accountType !== AccountType.FOREMAN ? (
            <NavbarLink isActive={pathname.includes("/jobs")} href="/jobs">
              Jobs
            </NavbarLink>
          ) : null}
          {/* Job coordinator cannot access timesheets page. */}
          {actor.accountType !== AccountType.COORDINATOR && (
            <NavbarLink isActive={pathname.includes("/timesheets")} href="/timesheets">
              Timesheets
            </NavbarLink>
          )}
          {/* Only dev or admins can access audit log page. */}
          {ACCOUNT_TYPES_DEV_ADMIN.includes(actor.accountType) && (
            <NavbarLink isActive={pathname.includes("/audit-log")} href="/audit-log">
              Audit Log
            </NavbarLink>
          )}
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justifyContent="end">
        <UserButton />
      </NavbarContent>
    </Navbar>
  );
};
