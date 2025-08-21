import { pgTable, serial, text, timestamp, boolean, decimal, integer, varchar, uuid, pgEnum, real } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const userRoleEnum = pgEnum('user_role', ['passenger', 'driver', 'admin'])
export const rideStatusEnum = pgEnum('ride_status', ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded'])
export const driverStatusEnum = pgEnum('driver_status', ['available', 'busy', 'offline'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  password: text('password').notNull(),
  role: userRoleEnum('role').default('passenger'),
  isEmailVerified: boolean('is_email_verified').default(false),
  profileImage: text('profile_image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const drivers = pgTable('drivers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }).notNull().unique(),
  vehicleMake: varchar('vehicle_make', { length: 50 }).notNull(),
  vehicleModel: varchar('vehicle_model', { length: 50 }).notNull(),
  vehicleYear: integer('vehicle_year').notNull(),
  vehiclePlate: varchar('vehicle_plate', { length: 20 }).notNull(),
  vehicleColor: varchar('vehicle_color', { length: 30 }).notNull(),
  cprCertified: boolean('cpr_certified').default(false),
  backgroundCheck: boolean('background_check').default(false),
  status: driverStatusEnum('status').default('available'),
  rating: real('rating').default(5.0),
  totalRides: integer('total_rides').default(0),
  currentLatitude: real('current_latitude'),
  currentLongitude: real('current_longitude'),
  isApproved: boolean('is_approved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const passengers = pgTable('passengers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  medicalNotes: text('medical_notes'),
  dueDate: timestamp('due_date'),
  isPregnant: boolean('is_pregnant').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const rides = pgTable('rides', {
  id: serial('id').primaryKey(),
  passengerId: integer('passenger_id').references(() => passengers.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id),
  pickupAddress: text('pickup_address').notNull(),
  pickupLatitude: real('pickup_latitude').notNull(),
  pickupLongitude: real('pickup_longitude').notNull(),
  destinationAddress: text('destination_address').notNull(),
  destinationLatitude: real('destination_latitude').notNull(),
  destinationLongitude: real('destination_longitude').notNull(),
  scheduledTime: timestamp('scheduled_time'),
  actualPickupTime: timestamp('actual_pickup_time'),
  actualDropoffTime: timestamp('actual_dropoff_time'),
  status: rideStatusEnum('status').default('pending'),
  fareAmount: decimal('fare_amount', { precision: 10, scale: 2 }),
  distance: real('distance'),
  duration: integer('duration'),
  notes: text('notes'),
  isEmergency: boolean('is_emergency').default(false),
  rating: integer('rating'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  rideId: integer('ride_id').references(() => rides.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  status: paymentStatusEnum('status').default('pending'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  relatedRideId: integer('related_ride_id').references(() => rides.id),
  createdAt: timestamp('created_at').defaultNow(),
})

export const rideRequests = pgTable('ride_requests', {
  id: serial('id').primaryKey(),
  rideId: integer('ride_id').references(() => rides.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id).notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  responseTime: timestamp('response_time'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  driver: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  passenger: one(passengers, {
    fields: [users.id],
    references: [passengers.userId],
  }),
  notifications: many(notifications),
}))

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  rides: many(rides),
  rideRequests: many(rideRequests),
}))

export const passengersRelations = relations(passengers, ({ one, many }) => ({
  user: one(users, {
    fields: [passengers.userId],
    references: [users.id],
  }),
  rides: many(rides),
}))

export const ridesRelations = relations(rides, ({ one, many }) => ({
  passenger: one(passengers, {
    fields: [rides.passengerId],
    references: [passengers.id],
  }),
  driver: one(drivers, {
    fields: [rides.driverId],
    references: [drivers.id],
  }),
  payment: one(payments),
  notifications: many(notifications),
  rideRequests: many(rideRequests),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  ride: one(rides, {
    fields: [payments.rideId],
    references: [rides.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  ride: one(rides, {
    fields: [notifications.relatedRideId],
    references: [rides.id],
  }),
}))

export const rideRequestsRelations = relations(rideRequests, ({ one }) => ({
  ride: one(rides, {
    fields: [rideRequests.rideId],
    references: [rides.id],
  }),
  driver: one(drivers, {
    fields: [rideRequests.driverId],
    references: [drivers.id],
  }),
}))