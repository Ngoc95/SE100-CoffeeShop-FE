export interface StaffMember {
  id: string;
  staffCode: string;
  fullName: string;
  phone: string;
  idCard: string;
  gender: "male" | "female";
  birthDate: string;
  position: string;
  positionLabel: string;
  joinDate: string;
  salary: number;
  status: "active" | "inactive";
  address: {
    city: string;
    ward: string;
    detail: string;
  };
}

// Danh sách nhân viên (không bao gồm quản lý)
export const staffMembers: StaffMember[] = [
  {
    id: "2",
    staffCode: "NV002",
    fullName: "Trần Thị B",
    phone: "0912345678",
    idCard: "001234567891",
    gender: "female",
    birthDate: "1992-02-02",
    position: "barista",
    positionLabel: "Pha chế",
    joinDate: "2023-03-20",
    salary: 8000000,
    status: "active",
    address: {
      city: "TP. Hồ Chí Minh",
      ward: "Phường 1, Quận 3",
      detail: "456 Võ Văn Tần",
    },
  },
  {
    id: "3",
    staffCode: "NV003",
    fullName: "Lê Văn C",
    phone: "0923456789",
    idCard: "001234567892",
    gender: "male",
    birthDate: "1994-03-03",
    position: "cashier",
    positionLabel: "Thu ngân",
    joinDate: "2023-05-10",
    salary: 7000000,
    status: "active",
    address: {
      city: "TP. Hồ Chí Minh",
      ward: "Phường 5, Quận 5",
      detail: "789 Trần Hưng Đạo",
    },
  },
  {
    id: "4",
    staffCode: "NV004",
    fullName: "Phạm Thị D",
    phone: "0934567890",
    idCard: "001234567893",
    gender: "female",
    birthDate: "1996-04-04",
    position: "server",
    positionLabel: "Phục vụ",
    joinDate: "2023-07-01",
    salary: 6500000,
    status: "active",
    address: {
      city: "TP. Hồ Chí Minh",
      ward: "Phường Tân Phú, Quận 7",
      detail: "321 Nguyễn Văn Linh",
    },
  },
  {
    id: "5",
    staffCode: "NV005",
    fullName: "Hoàng Văn E",
    phone: "0945678901",
    idCard: "001234567894",
    gender: "male",
    birthDate: "1998-05-05",
    position: "barista",
    positionLabel: "Pha chế",
    joinDate: "2023-02-14",
    salary: 8000000,
    status: "active",
    address: {
      city: "Hà Nội",
      ward: "Phường Cầu Dền, Hai Bà Trưng",
      detail: "555 Bà Triệu",
    },
  },
];

// Schedule data - chỉ hiển thị khi có lịch làm việc
export const initialSchedule: Record<string, Record<string, string[]>> = {
  "2": {
    T2: ["1"],
    T3: ["1", "2"],
    T4: ["1"],
    T5: ["1"],
    T6: ["1"],
    T7: ["2"],
    CN: ["2"],
  },
  "3": {
    T2: ["2"],
    T3: [],
    T4: ["2"],
    T5: ["2"],
    T6: [],
    T7: ["1", "2"],
    CN: ["1"],
  },
  "4": {
    T2: ["2"],
    T3: ["2"],
    T4: [],
    T5: ["2"],
    T6: ["2"],
    T7: ["2"],
    CN: [],
  },
  "5": {
    T2: ["1"],
    T3: ["1"],
    T4: ["1", "2"],
    T5: ["1"],
    T6: ["1"],
    T7: ["1"],
    CN: ["2"],
  },
};
