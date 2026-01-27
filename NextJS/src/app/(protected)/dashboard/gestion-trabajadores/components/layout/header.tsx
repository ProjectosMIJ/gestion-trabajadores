"use client";

import { SignOut } from "@/components/signout-button";

export function HeaderLayout({
  children,
  title,
  subtitle,
}: Readonly<{
  children: React.ReactNode;
  title: string;
  subtitle: string;
}>) {
  return (
    <header className="border-b border-border  px-6 py-4 shadow-sm sticky top-0 bg-blue-900/100 w-full flex flex-row justify-between items-center ">
      <div className="flex flex-row items-center justify-start gap-10 text-white w-full">
        <div>{children}</div>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold  text-white">{title}</h1>
          <p className="text-sm  text-white">{subtitle}</p>
        </div>
      </div>
      <SignOut />
    </header>
  );
}
