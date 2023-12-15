import React from "react";
import Main from "./Main";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/my/organization", name: "My Organization" }]}
      />
      <Main />
    </div>
  );
}
