"use client";

import { Heading } from "@chakra-ui/react";
import { UserButton } from "@clerk/nextjs";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarLink } from "@saas-ui/react";
import { usePathname } from "next/navigation";

export const SmartNavbar = () => {
  const pathname = usePathname();

  return (
    <Navbar borderBottomWidth="1px">
      <NavbarBrand>
        <Heading>Tory&apos;s Timesheet</Heading>
      </NavbarBrand>
      <NavbarContent>
        <NavbarItem>
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
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justifyContent="end">
        <UserButton />
      </NavbarContent>
    </Navbar>
  );
};
