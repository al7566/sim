import { pgTable, serial, text, varchar, decimal, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core'

/**
 * Affiliates table
 */
export const affiliates = pgTable('affiliates', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  affiliateCode: varchar('affiliate_code', { length: 50 }).notNull().unique(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull().default('30.00'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  paypalEmail: varchar('paypal_email', { length: 255 }),
  totalEarnings: decimal('total_earnings', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalPaid: decimal('total_paid', { precision: 12, scale: 2 }).notNull().default('0.00'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * Referrals table
 */
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  affiliateId: integer('affiliate_id').notNull().references(() => affiliates.id),
  clickId: varchar('click_id', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  converted: boolean('converted').notNull().default(false),
  conversionDate: timestamp('conversion_date'),
  orderId: varchar('order_id', { length: 255 }),
  provider: varchar('provider', { length: 20 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Commissions table
 */
export const commissions = pgTable('commissions', {
  id: serial('id').primaryKey(),
  affiliateId: integer('affiliate_id').notNull().references(() => affiliates.id),
  referralId: integer('referral_id').references(() => referrals.id),
  provider: varchar('provider', { length: 20 }).notNull(),
  transactionId: varchar('transaction_id', { length: 255 }).notNull(),
  saleAmount: decimal('sale_amount', { precision: 12, scale: 2 }).notNull(),
  commissionAmount: decimal('commission_amount', { precision: 12, scale: 2 }).notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  type: varchar('type', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Payouts table
 */
export const payouts = pgTable('payouts', {
  id: serial('id').primaryKey(),
  affiliateId: integer('affiliate_id').notNull().references(() => affiliates.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  method: varchar('method', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
})
