import { AppHeader } from "@/components/layout/app-header";

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return (
    <>
      <AppHeader role="teacher" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
