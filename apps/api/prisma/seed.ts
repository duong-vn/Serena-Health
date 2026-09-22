import { PrismaClient, Role, Gender } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hashPassword } from '../src/auth/password.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required for seeding');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function seed() {
  console.log('Seeding Serene Health database...');
  const commonPassword = await hashPassword('ClinicAdmin@2026!');

  // 1. Clinics
  const clinicA = await prisma.clinic.upsert({
    where: { code: 'BRANCH_A' },
    update: { name: 'Chi nhánh A — Quận 1', address: '123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM', phone: '02812345678' },
    create: { code: 'BRANCH_A', name: 'Chi nhánh A — Quận 1', address: '123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM', phone: '02812345678' },
  });
  const clinicB = await prisma.clinic.upsert({
    where: { code: 'BRANCH_B' },
    update: { name: 'Chi nhánh B — Quận 3', address: '456 Võ Văn Tần, Phường 5, Quận 3, TP.HCM', phone: '02823456789' },
    create: { code: 'BRANCH_B', name: 'Chi nhánh B — Quận 3', address: '456 Võ Văn Tần, Phường 5, Quận 3, TP.HCM', phone: '02823456789' },
  });
  const clinicC = await prisma.clinic.upsert({
    where: { code: 'BRANCH_C' },
    update: { name: 'Chi nhánh C — TP. Thủ Đức', address: '789 Lê Văn Việt, P. Tăng Nhơn Phú A, TP. Thủ Đức', phone: '02834567890' },
    create: { code: 'BRANCH_C', name: 'Chi nhánh C — TP. Thủ Đức', address: '789 Lê Văn Việt, P. Tăng Nhơn Phú A, TP. Thủ Đức', phone: '02834567890' },
  });

  // 2. Services
  const srvCardio = await prisma.medicalService.upsert({
    where: { code: 'SRV_CARDIO' },
    update: {},
    create: { code: 'SRV_CARDIO', name: 'Khám Tim mạch', specialty: 'Tim mạch', durationMinutes: 30, price: 300_000 },
  });
  const srvEndo = await prisma.medicalService.upsert({
    where: { code: 'SRV_ENDO' },
    update: {},
    create: { code: 'SRV_ENDO', name: 'Khám Nội tiết', specialty: 'Nội tiết', durationMinutes: 30, price: 250_000 },
  });
  const srvPed = await prisma.medicalService.upsert({
    where: { code: 'SRV_PED' },
    update: {},
    create: { code: 'SRV_PED', name: 'Khám Nhi', specialty: 'Nhi khoa', durationMinutes: 30, price: 200_000 },
  });
  const srvDerm = await prisma.medicalService.upsert({
    where: { code: 'SRV_DERM' },
    update: {},
    create: { code: 'SRV_DERM', name: 'Khám Da liễu', specialty: 'Da liễu', durationMinutes: 30, price: 250_000 },
  });
  const srvGeneral = await prisma.medicalService.upsert({
    where: { code: 'SRV_GENERAL' },
    update: {},
    create: { code: 'SRV_GENERAL', name: 'Khám Đa khoa Tổng quát', specialty: 'Đa khoa', durationMinutes: 30, price: 200_000 },
  });
  const srvOrtho = await prisma.medicalService.upsert({
    where: { code: 'SRV_ORTHO' },
    update: {},
    create: { code: 'SRV_ORTHO', name: 'Khám Cơ Xương Khớp', specialty: 'Cơ Xương Khớp', durationMinutes: 30, price: 280_000 },
  });
  const srvNeuro = await prisma.medicalService.upsert({
    where: { code: 'SRV_NEURO' },
    update: {},
    create: { code: 'SRV_NEURO', name: 'Khám Nội Thần kinh', specialty: 'Thần kinh', durationMinutes: 30, price: 320_000 },
  });

  // 3. System Accounts
  await prisma.user.upsert({
    where: { email: 'manager@clinic.vn' },
    update: {},
    create: { email: 'manager@clinic.vn', fullName: 'Quản Lý Trưởng', passwordHash: commonPassword, role: Role.MANAGER },
  });

  await prisma.user.upsert({
    where: { email: 'expert@clinic.vn' },
    update: {},
    create: { email: 'expert@clinic.vn', fullName: 'Bác Sĩ Thẩm Định', passwordHash: commonPassword, role: Role.EXPERT },
  });

  // 4. Doctors List
  const doctorsData = [
    {
      email: 'doctor@clinic.vn',
      fullName: 'BS. CKII Nguyễn Văn A',
      phone: '0901112233',
      gender: Gender.MALE,
      clinicId: clinicA.id,
      serviceId: srvCardio.id,
      licenseNumber: 'CCHN-00123-HCM',
      degree: 'Bác sĩ Chuyên khoa II',
      biography: 'Chuyên gia tim mạch với hơn 15 năm kinh nghiệm chẩn đoán và điều trị bệnh lý mạch vành, huyết áp.',
      avatarColor: 'forest',
      yearsExperience: 15,
      consultationFee: 150_000,
      examinationFee: 300_000,
      schedules: [
        // Thứ 2 đến Thứ 6 sáng & chiều
        { days: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '11:30' },
        { days: [1, 2, 3, 4, 5], startTime: '13:30', endTime: '16:30' },
      ],
    },
    {
      email: 'doctor.lan@clinic.vn',
      fullName: 'ThS. BS Lê Thị Lan',
      phone: '0902223344',
      gender: Gender.FEMALE,
      clinicId: clinicA.id,
      serviceId: srvEndo.id,
      licenseNumber: 'CCHN-00234-HCM',
      degree: 'Thạc sĩ Y học — Bác sĩ Nội trú',
      biography: 'Chuyên khoa Nội tiết — Đái tháo đường và bệnh lý tuyến giáp. Tận tâm và ân cần với bệnh nhân.',
      avatarColor: 'sage',
      yearsExperience: 12,
      consultationFee: 150_000,
      examinationFee: 250_000,
      schedules: [
        // Thứ 2 đến Thứ 7: Sáng & Chiều
        { days: [1, 2, 3, 4, 5, 6], startTime: '08:30', endTime: '12:00' },
        { days: [1, 2, 3, 4, 5, 6], startTime: '13:30', endTime: '17:30' },
      ],
    },
    {
      email: 'doctor.minh@clinic.vn',
      fullName: 'BS. CKI Trần Quang Minh',
      phone: '0903334455',
      gender: Gender.MALE,
      clinicId: clinicB.id,
      serviceId: srvPed.id,
      licenseNumber: 'CCHN-00345-HCM',
      degree: 'Bác sĩ Chuyên khoa I',
      biography: 'Bác sĩ Nhi khoa giàu kinh nghiệm chăm sóc sức khỏe sơ sinh, bệnh hô hấp và dinh dưỡng trẻ em.',
      avatarColor: 'warm',
      yearsExperience: 10,
      consultationFee: 120_000,
      examinationFee: 200_000,
      schedules: [
        // Thứ 2 đến Chủ nhật (0 đến 6): Đầy đủ các ngày
        { days: [0, 1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '12:00' },
        { days: [0, 1, 2, 3, 4, 5, 6], startTime: '14:00', endTime: '17:30' },
      ],
    },
    {
      email: 'doctor.huong@clinic.vn',
      fullName: 'BSCKII Phạm Thu Hương',
      phone: '0904445566',
      gender: Gender.FEMALE,
      clinicId: clinicB.id,
      serviceId: srvDerm.id,
      licenseNumber: 'CCHN-00456-HCM',
      degree: 'Bác sĩ Chuyên khoa II Da liễu',
      biography: 'Chuyên gia Da liễu thẩm mỹ và điều trị các bệnh lý dị ứng, mụn trứng cá, viêm da cơ địa.',
      avatarColor: 'rose',
      yearsExperience: 14,
      consultationFee: 150_000,
      examinationFee: 250_000,
      schedules: [
        // Thứ 2, 3, 4, 5, 6, 7
        { days: [1, 2, 3, 4, 5, 6], startTime: '08:30', endTime: '12:00' },
        { days: [1, 2, 3, 4, 5, 6], startTime: '13:30', endTime: '17:00' },
      ],
    },
    {
      email: 'doctor.thanh@clinic.vn',
      fullName: 'ThS. BS Hoàng Trọng Thành',
      phone: '0905556677',
      gender: Gender.MALE,
      clinicId: clinicC.id,
      serviceId: srvOrtho.id,
      licenseNumber: 'CCHN-00567-HCM',
      degree: 'Thạc sĩ Bác sĩ Cơ Xương Khớp',
      biography: 'Chẩn đoán và phục hồi chức năng đau khớp gối, thoái hóa cột sống cổ, thắt lưng và thoát vị đĩa đệm.',
      avatarColor: 'teal',
      yearsExperience: 11,
      consultationFee: 150_000,
      examinationFee: 280_000,
      schedules: [
        // Thứ 2 đến Thứ 6 & Chủ Nhật
        { days: [0, 1, 2, 3, 4, 5], startTime: '08:00', endTime: '12:00' },
        { days: [0, 1, 2, 3, 4, 5], startTime: '13:30', endTime: '17:30' },
      ],
    },
    {
      email: 'doctor.duc@clinic.vn',
      fullName: 'TS. BS Vũ Anh Đức',
      phone: '0906667788',
      gender: Gender.MALE,
      clinicId: clinicC.id,
      serviceId: srvNeuro.id,
      licenseNumber: 'CCHN-00678-HCM',
      degree: 'Tiến sĩ Y khoa — Chuyên khoa Thần kinh',
      biography: 'Hơn 18 năm kinh nghiệm điều trị đau đầu mạn tính, rối loạn tiền đình, mất ngủ và đau dây thần kinh.',
      avatarColor: 'indigo',
      yearsExperience: 18,
      consultationFee: 200_000,
      examinationFee: 320_000,
      schedules: [
        // Thứ 2, 3, 4, 5, 6, 7
        { days: [1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '11:30' },
        { days: [1, 2, 3, 4, 5, 6], startTime: '13:30', endTime: '16:30' },
      ],
    },
    {
      email: 'doctor.mai@clinic.vn',
      fullName: 'BS. CKI Đỗ Phương Mai',
      phone: '0907778899',
      gender: Gender.FEMALE,
      clinicId: clinicA.id,
      serviceId: srvGeneral.id,
      licenseNumber: 'CCHN-00789-HCM',
      degree: 'Bác sĩ Chuyên khoa I Đa khoa',
      biography: 'Tư vấn tầm soát sức khỏe tổng quát gia đình, kiểm tra định kỳ và tư vấn lối sống phòng ngừa bệnh tật.',
      avatarColor: 'emerald',
      yearsExperience: 13,
      consultationFee: 100_000,
      examinationFee: 200_000,
      schedules: [
        // Hàng ngày (Thứ 2 đến Chủ nhật)
        { days: [0, 1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '12:00' },
        { days: [0, 1, 2, 3, 4, 5, 6], startTime: '13:30', endTime: '17:30' },
      ],
    },
  ];

  for (const doc of doctorsData) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: { fullName: doc.fullName, phone: doc.phone, gender: doc.gender },
      create: {
        email: doc.email,
        fullName: doc.fullName,
        phone: doc.phone,
        passwordHash: commonPassword,
        role: Role.DOCTOR,
        gender: doc.gender,
      },
    });

    const profile = await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {
        clinicId: doc.clinicId,
        serviceId: doc.serviceId,
        biography: doc.biography,
        degree: doc.degree,
        licenseNumber: doc.licenseNumber,
        yearsExperience: doc.yearsExperience,
        consultationFee: doc.consultationFee,
        examinationFee: doc.examinationFee,
      },
      create: {
        userId: user.id,
        clinicId: doc.clinicId,
        serviceId: doc.serviceId,
        licenseNumber: doc.licenseNumber,
        degree: doc.degree,
        biography: doc.biography,
        address: 'TP.HCM',
        avatarColor: doc.avatarColor,
        yearsExperience: doc.yearsExperience,
        consultationFee: doc.consultationFee,
        examinationFee: doc.examinationFee,
      },
    });

    // Seed Schedules
    for (const sched of doc.schedules) {
      for (const day of sched.days) {
        await prisma.doctorSchedule.upsert({
          where: {
            doctorId_dayOfWeek_startTime_endTime: {
              doctorId: profile.id,
              dayOfWeek: day,
              startTime: sched.startTime,
              endTime: sched.endTime,
            },
          },
          update: {},
          create: {
            doctorId: profile.id,
            dayOfWeek: day,
            startTime: sched.startTime,
            endTime: sched.endTime,
          },
        });
      }
    }
  }

  // 5. Patient Account
  await prisma.user.upsert({
    where: { email: 'patient@clinic.vn' },
    update: {},
    create: {
      email: 'patient@clinic.vn',
      fullName: 'Trần Văn Bệnh Nhân',
      phone: '0909998877',
      passwordHash: commonPassword,
      role: Role.PATIENT,
      gender: Gender.MALE,
      birthday: new Date('1990-05-15'),
      patientProfile: {
        create: {
          bloodType: 'O+',
          allergies: ['Penicillin'],
          medicalHistory: ['Tiền sử tăng huyết áp nhẹ'],
        },
      },
    },
  });

  console.log('Seed completed successfully with 7 doctors across 3 branches and multiple specialties.');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
