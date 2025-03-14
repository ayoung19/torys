"use client";

import { Badge, Heading, Stack } from "@chakra-ui/react";
import { UserButton } from "@clerk/nextjs";
import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarLink } from "@saas-ui/react";
import { usePathname } from "next/navigation";

export const SmartNavbar = () => {
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
          <NavbarLink isActive={pathname.includes("/dashboard")} href="/dashboard">
            Dashboard
          </NavbarLink>
          <NavbarLink isActive={pathname.includes("/employees")} href="/employees">
            Employees
          </NavbarLink>
          <NavbarLink isActive={pathname.includes("/accounts")} href="/accounts">
            Accounts
          </NavbarLink>
          <NavbarLink isActive={pathname.includes("/jobs")} href="/jobs">
            Jobs
          </NavbarLink>
          <NavbarLink isActive={pathname.includes("/timesheets")} href="/timesheets">
            Timesheets
          </NavbarLink>
          <NavbarLink isActive={pathname.includes("/audit-log")} href="/audit-log">
            Audit Log
          </NavbarLink>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justifyContent="end">
        <UserButton />
      </NavbarContent>
    </Navbar>
  );
};
