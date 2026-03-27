"use client";
import PageLayout from "@/components/layout/page-layout";
import TableUser from "./tableUser/page";
import useSWR from "swr";
import { getUsers } from "../../api/getInfo";

export default function UsersPage() {
  const { data: user, isLoading: isLoadingUser } = useSWR(
    "users",
    async () => await getUsers(),
  );
  return (
    <PageLayout title="Usuarios">
      <TableUser user={user?.data ?? []} />
    </PageLayout>
  );
}
