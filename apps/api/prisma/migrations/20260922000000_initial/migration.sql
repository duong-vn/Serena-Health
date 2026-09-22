CREATE TYPE "Role" AS ENUM ('PATIENT', 'DOCTOR', 'EXPERT', 'MANAGER');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ConsultationStatus" AS ENUM ('AI_CHAT', 'ESCALATION_REQUESTED', 'ASSIGNED_TO_DOCTOR', 'DOCTOR_CHAT', 'COMPLETED');
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'DOCTOR', 'SYSTEM');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(32), "fullName" VARCHAR(160) NOT NULL, "passwordHash" VARCHAR(255) NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'PATIENT', "active" BOOLEAN NOT NULL DEFAULT true,
  "gender" "Gender", "birthday" DATE, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PatientProfile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "userId" UUID NOT NULL, "address" VARCHAR(500), "bloodType" VARCHAR(8),
  "medicalHistory" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "allergies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL, CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Clinic" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "code" VARCHAR(50) NOT NULL, "name" VARCHAR(255) NOT NULL,
  "address" VARCHAR(500) NOT NULL, "phone" VARCHAR(32), "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MedicalService" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "code" VARCHAR(50) NOT NULL, "name" VARCHAR(255) NOT NULL,
  "specialty" VARCHAR(120) NOT NULL, "description" TEXT, "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "price" DECIMAL(12,2) NOT NULL DEFAULT 0, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "MedicalService_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DoctorProfile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "userId" UUID NOT NULL, "clinicId" UUID NOT NULL,
  "serviceId" UUID NOT NULL, "licenseNumber" VARCHAR(100) NOT NULL, "degree" VARCHAR(255), "biography" TEXT,
  "address" VARCHAR(500), "avatarColor" VARCHAR(20), "yearsExperience" INTEGER NOT NULL DEFAULT 0,
  "consultationFee" DECIMAL(12,2) NOT NULL DEFAULT 0, "examinationFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL, CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DoctorSchedule" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "doctorId" UUID NOT NULL, "dayOfWeek" SMALLINT NOT NULL,
  "startTime" CHAR(5) NOT NULL, "endTime" CHAR(5) NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY ("id"), CONSTRAINT "DoctorSchedule_valid_day" CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  CONSTRAINT "DoctorSchedule_valid_time" CHECK ("startTime" < "endTime")
);
CREATE TABLE "Appointment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "patientId" UUID NOT NULL, "doctorId" UUID NOT NULL,
  "serviceId" UUID NOT NULL, "startAt" TIMESTAMPTZ(3) NOT NULL, "endAt" TIMESTAMPTZ(3) NOT NULL,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING', "reason" TEXT, "notes" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"), CONSTRAINT "Appointment_valid_range" CHECK ("endAt" > "startAt")
);
CREATE TABLE "Conversation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "patientId" UUID NOT NULL, "title" VARCHAR(200) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  "generationExpiresAt" TIMESTAMPTZ(3), CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Message" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "conversationId" UUID NOT NULL, "senderUserId" UUID,
  "role" "MessageRole" NOT NULL, "content" TEXT NOT NULL, "parts" JSONB, "model" VARCHAR(120), "metadata" JSONB,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Consultation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "conversationId" UUID NOT NULL, "patientId" UUID NOT NULL,
  "doctorId" UUID, "status" "ConsultationStatus" NOT NULL DEFAULT 'AI_CHAT', "summary" TEXT, "reason" TEXT,
  "notes" TEXT, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  "completedAt" TIMESTAMPTZ(3), CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ExpertReview" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "conversationId" UUID NOT NULL, "reviewerId" UUID NOT NULL,
  "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING', "flagReason" VARCHAR(255), "notes" TEXT NOT NULL,
  "resolution" TEXT, "resolvedAt" TIMESTAMPTZ(3), "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL, CONSTRAINT "ExpertReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_active_idx" ON "User"("role", "active");
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "PatientProfile"("userId");
CREATE UNIQUE INDEX "Clinic_code_key" ON "Clinic"("code");
CREATE INDEX "Clinic_active_name_idx" ON "Clinic"("active", "name");
CREATE UNIQUE INDEX "MedicalService_code_key" ON "MedicalService"("code");
CREATE INDEX "MedicalService_active_specialty_idx" ON "MedicalService"("active", "specialty");
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");
CREATE UNIQUE INDEX "DoctorProfile_licenseNumber_key" ON "DoctorProfile"("licenseNumber");
CREATE INDEX "DoctorProfile_clinicId_active_idx" ON "DoctorProfile"("clinicId", "active");
CREATE INDEX "DoctorProfile_serviceId_active_idx" ON "DoctorProfile"("serviceId", "active");
CREATE UNIQUE INDEX "DoctorSchedule_doctorId_dayOfWeek_startTime_endTime_key" ON "DoctorSchedule"("doctorId", "dayOfWeek", "startTime", "endTime");
CREATE INDEX "DoctorSchedule_doctorId_dayOfWeek_active_idx" ON "DoctorSchedule"("doctorId", "dayOfWeek", "active");
CREATE INDEX "Appointment_patientId_startAt_idx" ON "Appointment"("patientId", "startAt");
CREATE INDEX "Appointment_doctorId_startAt_idx" ON "Appointment"("doctorId", "startAt");
CREATE INDEX "Appointment_status_startAt_idx" ON "Appointment"("status", "startAt");
CREATE UNIQUE INDEX "Appointment_doctor_active_slot_key" ON "Appointment"("doctorId", "startAt") WHERE "status" IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS');
CREATE INDEX "Conversation_patientId_updatedAt_idx" ON "Conversation"("patientId", "updatedAt");
CREATE INDEX "Conversation_generationExpiresAt_idx" ON "Conversation"("generationExpiresAt");
CREATE INDEX "Message_conversationId_createdAt_id_idx" ON "Message"("conversationId", "createdAt", "id");
CREATE UNIQUE INDEX "Consultation_conversationId_key" ON "Consultation"("conversationId");
CREATE INDEX "Consultation_patientId_status_idx" ON "Consultation"("patientId", "status");
CREATE INDEX "Consultation_doctorId_status_idx" ON "Consultation"("doctorId", "status");
CREATE UNIQUE INDEX "ExpertReview_conversationId_reviewerId_key" ON "ExpertReview"("conversationId", "reviewerId");
CREATE INDEX "ExpertReview_status_createdAt_idx" ON "ExpertReview"("status", "createdAt");

ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MedicalService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DoctorSchedule" ADD CONSTRAINT "DoctorSchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MedicalService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpertReview" ADD CONSTRAINT "ExpertReview_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertReview" ADD CONSTRAINT "ExpertReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
