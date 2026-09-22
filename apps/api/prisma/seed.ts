import { PrismaClient, Role, Gender, AppointmentStatus, ConsultationStatus, MessageRole, ReviewStatus } from '../src/generated/prisma/client.js';
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

  // Clinics
  const clinicA = await prisma.clinic.upsert({
    where: { code: 'BRANCH_A' },
    update: {},
    create: { code: 'BRANCH_A', name: 'Chi nhánh A', address: '123 Nguyễn Huệ, Q.1, TP.HCM', phone: '02812345678' },
  });
  const clinicB = await prisma.clinic.upsert({
    where: { code: 'BRANCH_B' },
    update: {},
    create: { code: 'BRANCH_B', name: 'Chi nhánh B', address: '456 Võ Văn Tần, Q.3, TP.HCM', phone: '02823456789' },
  });
  const clinicC = await prisma.clinic.upsert({
    where: { code: 'BRANCH_C' },
    update: {},
    create: { code: 'BRANCH_C', name: 'Chi nhánh C', address: '789 Lê Văn Việt, TP.Thủ Đức', phone: '02834567890' },
  });

  // Services
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

  // Users
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@clinic.vn' },
    update: {},
    create: { email: 'manager@clinic.vn', fullName: 'Quản Lý Trưởng', passwordHash: commonPassword, role: Role.MANAGER },
  });

  const expertUser = await prisma.user.upsert({
    where: { email: 'expert@clinic.vn' },
    update: {},
    create: { email: 'expert@clinic.vn', fullName: 'Bác Sĩ Thẩm Định', passwordHash: commonPassword, role: Role.EXPERT },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@clinic.vn' },
    update: {},
    create: { email: 'doctor@clinic.vn', fullName: 'BS. CKII Nguyễn Văn A', phone: '0901112233', passwordHash: commonPassword, role: Role.DOCTOR, gender: Gender.MALE },
  });

  const doctorProfile = await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      clinicId: clinicA.id,
      serviceId: srvCardio.id,
      licenseNumber: 'CCHN-00123-HCM',
      degree: 'Bác sĩ Chuyên khoa II',
      biography: 'Chuyên gia tim mạch với hơn 15 năm kinh nghiệm chẩn đoán và điều trị.',
      address: 'TP.HCM',
      avatarColor: 'blue',
      yearsExperience: 15,
      consultationFee: 150_000,
      examinationFee: 300_000,
    },
  });

  // Doctor schedules (Mon to Fri mornings)
  for (let day = 1; day <= 5; day++) {
    await prisma.doctorSchedule.upsert({
      where: { doctorId_dayOfWeek_startTime_endTime: { doctorId: doctorProfile.id, dayOfWeek: day, startTime: '08:00', endTime: '12:00' } },
      update: {},
      create: { doctorId: doctorProfile.id, dayOfWeek: day, startTime: '08:00', endTime: '12:00' },
    });
  }

  // Patient
  const patientUser = await prisma.user.upsert({
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

  console.log('Seed completed successfully.');
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
