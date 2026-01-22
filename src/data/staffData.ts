export interface StaffMember {
  id: string;
  staffCode: string;
  fullName: string;
  phone: string;
  email?: string;
  idCard: string;
  gender: string;
  birthDate: string;
  position: string;
  positionLabel: string;
  joinDate: string;
  salary: number;
  status: "active" | "inactive" | "quit";
  address: {
    city: string;
    ward: string;
    detail: string;
  };
  salarySettings?: {
    salaryType: "shift" | "fixed";
    salaryAmount: string;
    advancedSetup: boolean;
    overtimeEnabled: boolean;
    shifts: Array<{
      id: string;
      name: string;
      salaryPerShift: string;
      saturdayCoeff: string;
      sundayCoeff: string;
      dayOffCoeff: string;
      holidayCoeff: string;
    }>;
    overtimeCoeffs: {
      weekday: string;
      saturday: string;
      sunday: string;
      dayOff: string;
      holiday: string;
    };
  };
  accountId?: string; // Link to Account ID
  account?: {
    username: string;
    roleId?: number;
  };
}

// Danh sách nhân viên đầy đủ
export const staffMembers: StaffMember[] = [
  {
    id: "1",
    staffCode: "NV001",
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    idCard: "001234567890",
    gender: "male",
    birthDate: "1990-01-01",
    position: "manager",
    positionLabel: "Quản lý",
    joinDate: "2023-01-15",
    salary: 0,
    status: "active",
    address: {
      city: "TP. Hồ Chí Minh",
      ward: "Phường Bến Nghé",
      detail: "123 Nguyễn Huệ",
    },
    account: {
      username: "nguyenvana",
    },
  },
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
    salary: 0,
    salarySettings: {
      salaryType: "fixed",
      salaryAmount: "8000000", // 8 triệu/tháng
      advancedSetup: false,
      overtimeEnabled: true,
      shifts: [],
      overtimeCoeffs: {
        weekday: "150%",
        saturday: "200%",
        sunday: "200%",
        dayOff: "150%",
        holiday: "300%",
      },
    },
    status: "active",
    address: {
      city: "TP. Hồ Chí Minh",
      ward: "Phường 1, Quận 3",
      detail: "456 Võ Văn Tần",
    },
    account: {
      username: "tranthib",
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
    salary: 0,
    salarySettings: {
      salaryType: "shift",
      salaryAmount: "180000",
      advancedSetup: true,
      overtimeEnabled: true,
      shifts: [
        {
          id: "1",
          name: "Ca sáng",
          salaryPerShift: "180000",
          saturdayCoeff: "150%",
          sundayCoeff: "200%",
          dayOffCoeff: "100%",
          holidayCoeff: "250%",
        },
        {
          id: "2",
          name: "Ca chiều",
          salaryPerShift: "180000",
          saturdayCoeff: "150%",
          sundayCoeff: "200%",
          dayOffCoeff: "100%",
          holidayCoeff: "250%",
        },
      ],
      overtimeCoeffs: {
        weekday: "150%",
        saturday: "200%",
        sunday: "200%",
        dayOff: "150%",
        holiday: "250%",
      },
    },
    status: "active",
    address: {
      city: "TP. Hồ Chí Minh",
      ward: "Phường 5, Quận 5",
      detail: "789 Trần Hưng Đạo",
    },
    account: {
      username: "levanc",
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
    salary: 0,
    salarySettings: {
      salaryType: "shift",
      salaryAmount: "150000",
      advancedSetup: true,
      overtimeEnabled: false,
      shifts: [
        {
          id: "1",
          name: "Ca sáng",
          salaryPerShift: "150000",
          saturdayCoeff: "150%",
          sundayCoeff: "200%",
          dayOffCoeff: "100%",
          holidayCoeff: "200%",
        },
        {
          id: "2",
          name: "Ca chiều",
          salaryPerShift: "150000",
          saturdayCoeff: "150%",
          sundayCoeff: "200%",
          dayOffCoeff: "100%",
          holidayCoeff: "200%",
        },
      ],
      overtimeCoeffs: {
        weekday: "150%",
        saturday: "150%",
        sunday: "150%",
        dayOff: "150%",
        holiday: "200%",
      },
    },
    status: "active",
    address: {
      city: "TP. Hồ Chí Minh",
      ward: "Phường Tân Phú, Quận 7",
      detail: "321 Nguyễn Văn Linh",
    },
    account: {
      username: "phamthid",
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
    salary: 0,
    salarySettings: {
      salaryType: "shift",
      salaryAmount: "180000",
      advancedSetup: true,
      overtimeEnabled: true,
      shifts: [
        {
          id: "1",
          name: "Ca sáng",
          salaryPerShift: "180000",
          saturdayCoeff: "150%",
          sundayCoeff: "200%",
          dayOffCoeff: "100%",
          holidayCoeff: "250%",
        },
        {
          id: "2",
          name: "Ca chiều",
          salaryPerShift: "180000",
          saturdayCoeff: "150%",
          sundayCoeff: "200%",
          dayOffCoeff: "100%",
          holidayCoeff: "250%",
        },
      ],
      overtimeCoeffs: {
        weekday: "150%",
        saturday: "200%",
        sunday: "200%",
        dayOff: "150%",
        holiday: "250%",
      },
    },
    status: "inactive",
    address: {
      city: "Hà Nội",
      ward: "Phường Cầu Dền, Hai Bà Trưng",
      detail: "555 Bà Triệu",
    },
    account: {
      username: "hoangvane",
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
