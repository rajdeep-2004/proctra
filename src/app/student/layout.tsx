import { AppHeader } from "@/components/layout/app-header";

export default function StudentLayout({ children }: LayoutProps<"/student">) {
  return (
    <>
      <AppHeader role="student" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
