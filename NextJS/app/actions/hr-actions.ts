"use server"

import type { Employee, KPIData, Movement } from "@/lib/types/hr"

// Simulated database data
const mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "Juan",
    lastName: "García",
    email: "juangarcia@gmail.com",
    phone: "+58412345678",
    department: { id: "dept-1", name: "Nomina", code: "SALES", employeeCount: 0 },
    position: "Sales Manager",
    startDate: new Date("2020-01-15"),
    status: "active",
    familyMembers: [
      {
        id: "fam-1",
        employeeId: "1",
        firstName: "María",
        lastName: "García",
        relationship: "spouse",
        dateOfBirth: new Date("1990-05-20"),
        createdAt: new Date(),
      },
    ],
    createdAt: new Date("2020-01-15"),
    updatedAt: new Date(),
  },
  {
    id: "2",
    firstName: "Ana",
    lastName: "López",
    email: "analopez@gmail.com",
    phone: "+58 412 345 679",
    department: { id: "dept-2", name: "OTIC", code: "OTIC", employeeCount: 0 },
    position: "Senior Developer",
    startDate: new Date("2019-03-10"),
    status: "active",
    familyMembers: [],
    createdAt: new Date("2019-03-10"),
    updatedAt: new Date(),
  },
  {
    id: "3",
    firstName: "Carlos",
    lastName: "Martínez",
    email: "carlosmartinez@gmail.com",
    phone: "+58 412 345 680",
    department: { id: "dept-3", name: "Administracion de personal", code: "ADMIN", employeeCount: 0 },
    position: "HR Manager",
    startDate: new Date("2021-06-01"),
    status: "active",
    familyMembers: [
      {
        id: "fam-2",
        employeeId: "3",
        firstName: "Sofia",
        lastName: "Martínez",
        relationship: "child",
        dateOfBirth: new Date("2015-08-30"),
        createdAt: new Date(),
      },
    ],
    createdAt: new Date("2021-06-01"),
    updatedAt: new Date(),
  },
]

const mockMovements: Movement[] = [
  {
    id: "mov-1",
    employeeId: "1",
    employee: mockEmployees[0],
    type: "promotion",
    fromDepartment: { id: "dept-1", name: "Administracion de personal", code: "SALES", employeeCount: 0 },
    toDepartment: { id: "dept-1", name: "Administracion de personal", code: "SALES", employeeCount: 0 },
    fromPosition: "Sales Associate",
    toPosition: "Sales Manager",
    date: new Date("2023-06-15"),
    reason: "Performance Excellence",
    createdAt: new Date("2023-06-15"),
  },
  {
    id: "mov-2",
    employeeId: "2",
    employee: mockEmployees[1],
    type: "transfer",
    fromDepartment: { id: "dept-2", name: "OTIC", code: "IT", employeeCount: 0 },
    toDepartment: { id: "dept-2", name: "OTIC", code: "IT", employeeCount: 0 },
    fromPosition: "Junior Developer",
    toPosition: "Senior Developer",
    date: new Date("2024-01-10"),
    createdAt: new Date("2024-01-10"),
  },
]

export async function getKPIData(): Promise<KPIData> {
  // Simulating async data fetch
  await new Promise((resolve) => setTimeout(resolve, 500))

  const activeEmployees = mockEmployees.filter((e) => e.status === "active").length
  const newHires = mockEmployees.filter(
    (e) => e.startDate > new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
  ).length

  const upcomingEgress = mockEmployees.filter(
    (e) => e.endDate && e.endDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  ).length

  const totalFamilyMembers = mockEmployees.reduce((sum, emp) => sum + emp.familyMembers.length, 0)

  const departments = [
    { id: "dept-1", name: "Nomina", code: "SALES", employeeCount: 0 },
    { id: "dept-2", name: "OTIC", code: "IT", employeeCount: 0 },
    { id: "dept-3", name: "Administracion de personal", code: "ADMIN", employeeCount: 0 },
  ]

  const deptDistribution = departments.map((dept) => {
    const count = mockEmployees.filter((e) => e.department.id === dept.id).length
    return {
      name: dept.name,
      count,
      percentage: Math.round((count / activeEmployees) * 100),
    }
  })

  return {
    activeEmployees,
    newHires,
    upcomingEgress,
    familyMembers: totalFamilyMembers,
    departmentDistribution: deptDistribution,
    recentMovements: mockMovements.slice(0, 7),
  }
}

export async function getEmployees(): Promise<Employee[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockEmployees
}

export async function getRecentMovements(limit = 7): Promise<Movement[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockMovements.slice(0, limit)
}

export async function getReportData() {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    turnover: [
      { month: "Ene", egress: 2, newHires: 8, balance: 6 },
      { month: "Feb", egress: 1, newHires: 5, balance: 4 },
      { month: "Mar", egress: 3, newHires: 12, balance: 9 },
      { month: "Abr", egress: 2, newHires: 7, balance: 5 },
      { month: "May", egress: 4, newHires: 15, balance: 11 },
      { month: "Jun", egress: 1, newHires: 6, balance: 5 },
    ],
    movements: mockMovements,
    employees: mockEmployees,
  }
}
