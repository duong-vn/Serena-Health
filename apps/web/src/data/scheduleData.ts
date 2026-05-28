export interface Patient {
  name: string
  id: string
  time: string
  fullName?: string
  gender?: 'Nam' | 'Nữ'
  age?: number
  phone?: string
  examType?: 'Tư vấn' | 'Khám trực tiếp' | 'Cả hai'
  status?: 'waiting' | 'completed' | 'in-progress' | 'priority'
  avatarColor?: string
}

export interface Shift {
  id: string
  title: string
  time: string
  count: number
  status?: string
  patients: Patient[]
}

export const MOCK_SHIFTS: Shift[] = [
  {
    id: 'morning',
    title: 'Ca sáng',
    time: '08:00 - 12:00',
    count: 8,
    status: 'Đang diễn ra',
    patients: [
      { name: 'Nguyễn Thị B', id: '#12345', time: '08:00' },
      { name: 'Lê Mạnh T', id: '#12344', time: '08:30' },
      { name: 'Trần Văn C', id: '#12346', time: '09:00' },
      { name: 'Lê Thị D', id: '#12347', time: '09:30' },
      { name: 'Phạm Văn E', id: '#12348', time: '10:00' },
      { name: 'Vũ Văn X', id: '#12399', time: '14:30' },
      { name: 'Đặng Thị Y', id: '#12400', time: '15:00' },
      { name: 'Trần Diệu N', id: '#12341', time: '15:30' },
    ],
  },
  {
    id: 'afternoon',
    title: 'Ca chiều',
    time: '14:00 - 18:00',
    count: 2,
    patients: [
      { name: 'Hoàng Văn A', id: '#12350', time: '14:00' },
      { name: 'Lý Thị K', id: '#12351', time: '15:00' },
    ],
  },
]

export const MOCK_EVENT_DATES = [
  '2024-05-06',
  '2024-05-07',
  '2024-05-08',
  '2024-05-10',
  '2024-05-13',
  '2024-05-15',
  '2024-05-20',
  '2024-05-27',
]

const baseScheduleData: Record<string, Shift[]> = {
  // Week 1 (4 - 8 May)
  '2026-05-04': [{ id: 'm04_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 2, patients: [{ name: 'Trần Văn C', id: '#12346', time: '09:00' }] }],
  '2026-05-05': [{ id: 'm05_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 3, patients: [{ name: 'Nguyễn Thị B', id: '#12345', time: '08:30' }] }],
  '2026-05-06': [
    {
      id: 'm06_1',
      title: 'Ca sáng',
      time: '08:00 - 12:00',
      count: 3,
      patients: [{ name: 'Lê Văn C', id: '#12347', time: '09:00' }],
    },
  ],
  '2026-05-07': [{ id: 'm07_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 1, patients: [{ name: 'Lê Thị D', id: '#12347', time: '09:30' }] }],
  '2026-05-08': [{ id: 'm08_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 2, patients: [{ name: 'Phạm Văn E', id: '#12348', time: '10:00' }] }],

  // Week 2 (11 - 15 May)
  // Thứ 2 - Ngày 11/05/2026
  '2026-05-11': [
    {
      id: 'm11_morning',
      title: 'Ca sáng',
      time: '08:00 - 12:00',
      count: 8,
      status: 'Đang diễn ra',
      patients: [
        { name: 'Nguyễn Thị B', id: '#12345', time: '08:00' },
        { name: 'Trần Văn C', id: '#12346', time: '09:00' },
      ],
    },
    {
      id: 'm11_afternoon',
      title: 'Ca chiều',
      time: '14:00 - 18:00',
      count: 6,
      patients: [{ name: 'Phạm Văn E', id: '#12348', time: '14:30' }],
    },
  ],
  '2026-05-12': [{ id: 'm12_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 4, patients: [{ name: 'Vũ Văn X', id: '#12399', time: '10:30' }] }],
  '2026-05-13': [{ id: 'm13_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 2, patients: [{ name: 'Đặng Thị Y', id: '#12400', time: '11:00' }] }],
  '2026-05-14': [{ id: 'm14_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 3, patients: [{ name: 'Trần Diệu N', id: '#12341', time: '11:30' }] }],
  // Thứ 6 - Ngày 15/05/2026
  '2026-05-15': [
    {
      id: 'a15_1',
      title: 'Ca chiều',
      time: '14:00 - 18:00',
      count: 2,
      patients: [{ name: 'Hoàng Văn A', id: '#12350', time: '15:00' }],
    },
  ],

  // Week 3 (18 - 22 May)
  '2026-05-18': [{ id: 'm18_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 1, patients: [{ name: 'Lý Thị K', id: '#12351', time: '09:00' }] }],
  '2026-05-19': [{ id: 'm19_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 2, patients: [{ name: 'Nguyễn Thị B', id: '#12345', time: '09:30' }] }],
  // Thứ 4 - Ngày 20/05/2026 (Has schedule, NO patients)
  '2026-05-20': [{ id: 'm20_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 1, patients: [] }],
  '2026-05-21': [{ id: 'm21_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 3, patients: [{ name: 'Trần Văn C', id: '#12346', time: '10:00' }] }],
  '2026-05-22': [{ id: 'm22_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 1, patients: [{ name: 'Lê Văn C', id: '#12347', time: '10:30' }] }],
  // Saturday - Ngày 23/05/2026 (Has schedule, NO patients)
  '2026-05-23': [{ id: 'm23_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 2, patients: [] }],

  // Week 4 (25 - 29 May)
  '2026-05-25': [{ id: 'm25_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 2, patients: [{ name: 'Lê Thị D', id: '#12347', time: '09:00' }] }],
  '2026-05-26': [{ id: 'm26_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 4, patients: [{ name: 'Phạm Văn E', id: '#12348', time: '09:30' }] }],
  // Thứ 4 - Ngày 27/05/2026 (Has schedule, NO patients)
  '2026-05-27': [{ id: 'm27_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 4, patients: [] }],
  '2026-05-28': [{ id: 'm28_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 1, patients: [] }],
  '2026-05-29': [{ id: 'm29_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 2, patients: [] }],
  '2026-05-30': [{ id: 'm30_1', title: 'Ca sáng', time: '08:00 - 12:00', count: 3, patients: [] }],
};

export const SCHEDULE_DATA: Record<string, Shift[]> = new Proxy(baseScheduleData, {
  get(target, prop) {
    if (typeof prop !== 'string') {
      return Reflect.get(target, prop);
    }
    // If the date is explicitly defined in target, return it
    if (prop in target) {
      return target[prop];
    }

    // Generate deterministically based on date string (YYYY-MM-DD)
    const dateParts = prop.split('-');
    if (dateParts.length !== 3) {
      return [];
    }

    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]); // 1-indexed
    const day = parseInt(dateParts[2]);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return [];
    }

    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0: Sunday, 1: Monday, ...

    // Sundays have no shifts
    if (dayOfWeek === 0) {
      return [];
    }

    // Saturdays have shift only if day is even
    if (dayOfWeek === 6 && day % 2 !== 0) {
      return [];
    }

    // Determine shift presence based on month-specific weekday patterns
    let hasShift = false;
    if (dayOfWeek === 6) {
      hasShift = true;
    } else {
      switch (month) {
        case 4: // April: Monday, Wednesday, Friday
          hasShift = [1, 3, 5].includes(dayOfWeek);
          break;
        case 6: // June: Tuesday, Thursday, Friday
          hasShift = [2, 4, 5].includes(dayOfWeek);
          break;
        case 7: // July: Monday, Wednesday, Thursday
          hasShift = [1, 3, 4].includes(dayOfWeek);
          break;
        default: // Other months: Monday, Tuesday, Friday
          hasShift = [1, 2, 5].includes(dayOfWeek);
          break;
      }
    }

    if (!hasShift) {
      return [];
    }

    // Decide if this day has appointments (patients)
    let hasPatients = false;
    if (month === 6) {
      hasPatients = day % 2 !== 0; // June odd days have patients
    } else if (month === 7) {
      hasPatients = day % 3 !== 0; // July days not divisible by 3 have patients
    } else {
      hasPatients = (day + month) % 4 !== 0;
    }

    const shifts: Shift[] = [];
    const hasMorning = (day + month) % 2 === 0;
    const hasAfternoon = !hasMorning || (day + month) % 3 === 0;

    const namesPool = [
      'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Đỗ Thị F',
      'Nguyễn Thị Hoa', 'Đỗ Hoàng Quân', 'Trần Văn Tú', 'Lê Văn Khang',
      'Hoàng Văn An', 'Lý Thị Kim', 'Vũ Văn Xuân', 'Đặng Thị Yến', 'Trần Diệu Ngân'
    ];

    const reasonsPool = [
      'Tái khám cao huyết áp', 'Khám định kỳ sức khỏe', 'Đau đầu mất ngủ',
      'Tư vấn dinh dưỡng', 'Đau nhức xương khớp', 'Đau dạ dày',
      'Ho khan kéo dài', 'Kiểm tra đường huyết', 'Tư vấn tim mạch'
    ];

    if (hasMorning) {
      const patientsCount = hasPatients ? (day % 3) + 1 : 0;
      const morningPatients: Patient[] = [];
      for (let i = 0; i < patientsCount; i++) {
        const nameIdx = (day + month + i) % namesPool.length;
        const reasonIdx = (day * month + i) % reasonsPool.length;
        const hour = 9 + i;
        morningPatients.push({
          id: `gen-m-${prop}-${i}`,
          name: namesPool[nameIdx],
          time: `${hour.toString().padStart(2, '0')}:00 - ${hour.toString().padStart(2, '0')}:30`,
          fullName: namesPool[nameIdx],
          gender: i % 2 === 0 ? 'Nam' : 'Nữ',
          age: 22 + ((day * i) % 50),
          phone: `09${((day * month * 123 + i) % 100000000).toString().padStart(8, '0')}`,
          examType: i % 2 === 0 ? 'Khám trực tiếp' : 'Tư vấn',
          status: 'waiting'
        });
      }

      shifts.push({
        id: `gen-shift-m-${prop}`,
        title: 'Ca sáng',
        time: '08:00 - 12:00',
        count: morningPatients.length,
        patients: morningPatients
      });
    }

    if (hasAfternoon) {
      const patientsCount = hasPatients ? (day % 2) + 1 : 0;
      const afternoonPatients: Patient[] = [];
      for (let i = 0; i < patientsCount; i++) {
        const nameIdx = (day * month + i) % namesPool.length;
        const reasonIdx = (day + month + i) % reasonsPool.length;
        const hour = 14 + i;
        afternoonPatients.push({
          id: `gen-a-${prop}-${i}`,
          name: namesPool[nameIdx],
          time: `${hour.toString().padStart(2, '0')}:00 - ${hour.toString().padStart(2, '0')}:30`,
          fullName: namesPool[nameIdx],
          gender: i % 2 === 0 ? 'Nữ' : 'Nam',
          age: 20 + ((day * 3 + i) % 55),
          phone: `09${((day * month * 321 + i) % 100000000).toString().padStart(8, '0')}`,
          examType: i % 2 === 0 ? 'Tư vấn' : 'Khám trực tiếp',
          status: 'waiting'
        });
      }

      shifts.push({
        id: `gen-shift-a-${prop}`,
        title: 'Ca chiều',
        time: '14:00 - 18:00',
        count: afternoonPatients.length,
        patients: afternoonPatients
      });
    }

    return shifts;
  }
}) as unknown as Record<string, Shift[]>;
