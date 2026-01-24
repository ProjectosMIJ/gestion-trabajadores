import TableEmployee from "../components/employees/tableEmployees/page";

export default function PersonalPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* <Header /> */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <TableEmployee />
        </main>
      </div>
    </div>
  );
}
