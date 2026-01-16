import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { EmployeeList } from "@/components/employees/employee-list"

export default function PersonalPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <EmployeeList />
        </main>
      </div>
    </div>
  )
}
