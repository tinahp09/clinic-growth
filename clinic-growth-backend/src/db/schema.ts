import { pgTable, text, timestamp, integer, boolean, pgEnum, uuid, decimal, jsonb } from 'drizzle-orm/pg-core';

export const bookingStatusEnum = pgEnum('booking_status', [
  'CREATED', 'RESERVED', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'FAILED_PAYMENT', 'EXPIRED'
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'INITIATED', 'REDIRECTED', 'PENDING_CALLBACK', 'VERIFIED', 'FAILED', 'ABANDONED', 'REFUNDED'
]);

export const refundStatusEnum = pgEnum('refund_status', [
  'REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED'
]);

export const staffRoleEnum = pgEnum('staff_role', [
  'DOCTOR', 'NURSE', 'TECHNICIAN', 'RECEPTIONIST'
]);

export const roomTypeEnum = pgEnum('room_type', [
  'CONSULTATION', 'TREATMENT', 'LASER', 'RECOVERY'
]);

export const roomStatusEnum = pgEnum('room_status', [
  'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'
]);

export const leaveTypeEnum = pgEnum('leave_type', [
  'SICK', 'ANNUAL', 'UNPAID'
]);

export const leaveStatusEnum = pgEnum('leave_status', [
  'PENDING', 'APPROVED', 'REJECTED'
]);

export const userRoleEnum = pgEnum('user_role', [
  'OWNER', 'ADMIN', 'RECEPTIONIST'
]);

export const mediaTypeEnum = pgEnum('media_type', [
  'BEFORE', 'AFTER', 'PROGRESS'
]);

// Tenants (clinics)
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  zarinpalMerchantId: text('zarinpal_merchant_id'),
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Users (admins/staff accounts)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  username: text('username').unique().notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  role: userRoleEnum('role').notNull().default('RECEPTIONIST'),
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Patients (clients)
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  mobile: text('mobile').notNull().unique(),
  email: text('email'),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Services
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  duration: integer('duration').notNull(),
  price: integer('price').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
  incompatibleWith: jsonb('incompatible_with').$type<string[]>().default([]),
  requiresRoom: roomTypeEnum('requires_room'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Staff
export const staff = pgTable('staff', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  role: staffRoleEnum('role').notNull(),
  specialty: text('specialty'),
  avatarUrl: text('avatar_url'),
  availableDays: jsonb('available_days').$type<number[]>().default([0, 1, 2, 3, 4]),
  workStart: text('work_start').default('09:00'),
  workEnd: text('work_end').default('17:00'),
  annualLeaveQuota: integer('annual_leave_quota').default(15),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Rooms
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: roomTypeEnum('type').notNull(),
  capacity: integer('capacity').default(1),
  status: roomStatusEnum('status').default('AVAILABLE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Bookings
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bookingNumber: text('booking_number').notNull().unique(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  patientName: text('patient_name').notNull(),
  patientPhone: text('patient_phone').notNull(),
  staffId: uuid('staff_id').references(() => staff.id, { onDelete: 'set null' }),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'set null' }),
  dateTime: timestamp('date_time').notNull(),
  status: bookingStatusEnum('status').default('CREATED').notNull(),
  paymentStatus: paymentStatusEnum('payment_status'),
  totalAmount: integer('total_amount').notNull(),
  notes: text('notes'),
  cancelReason: text('cancel_reason'),
  paymentRef: text('payment_ref'),
  reservedUntil: timestamp('reserved_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Booking Services (many-to-many)
export const bookingServices = pgTable('booking_services', {
  bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' })
});

// Transactions
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(),
  status: paymentStatusEnum('status').notNull(),
  zarinpalAuthority: text('zarinpal_authority'),
  zarinpalRef: text('zarinpal_ref'),
  bookingRef: text('booking_ref'),
  gatewayResponse: jsonb('gateway_response').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  verifiedAt: timestamp('verified_at')
});

// Staff Leaves
export const staffLeaves = pgTable('staff_leaves', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  type: leaveTypeEnum('type').notNull(),
  status: leaveStatusEnum('status').default('PENDING').notNull(),
  description: text('description'),
  requestedAt: timestamp('requested_at').defaultNow().notNull()
});

// Media
export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  serviceId: uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
  type: mediaTypeEnum('type').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  consentGiven: boolean('consent_given').default(false).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  publicConsentGiven: boolean('public_consent_given').default(false).notNull(),
  publicConsentAt: timestamp('public_consent_at'),
  isAnonymized: boolean('is_anonymized').default(false).notNull(),
  notes: text('notes'),
  visibleToClient: boolean('visible_to_client').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Type exports
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type BookingService = typeof bookingServices.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type StaffLeave = typeof staffLeaves.$inferSelect;
export type NewStaffLeave = typeof staffLeaves.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;