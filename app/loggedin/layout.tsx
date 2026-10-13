import AppShell from "@/components/nav/app-shell";
import Providers from "../providers";

export default function LoggedInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
