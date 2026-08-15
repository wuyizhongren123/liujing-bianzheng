import { pgTable, serial, timestamp, varchar, text, integer, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 系统表 - 保留
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 六经表 - 太阳、阳明、少阳、太阴、少阴、厥阴
export const sixMeridians = pgTable(
	"six_meridians",
	{
		id: serial().primaryKey(),
		name: varchar("name", { length: 50 }).notNull().unique(), // 经名：太阳、阳明等
		description: text("description"), // 经病概述
		pathogenesis: text("pathogenesis"), // 病机
		main_symptoms: text("main_symptoms"), // 主要症状
		sort_order: integer("sort_order").notNull().default(0), // 排序
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("six_meridians_name_idx").on(table.name),
		index("six_meridians_sort_order_idx").on(table.sort_order),
	]
);

// 证型表 - 每经下的不同证型
export const syndromes = pgTable(
	"syndromes",
	{
		id: serial().primaryKey(),
		meridian_id: integer("meridian_id").notNull().references(() => sixMeridians.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 100 }).notNull(), // 证型名称
		description: text("description"), // 证型描述
		symptoms: text("symptoms"), // 症状表现
		tongue_presentation: text("tongue_presentation"), // 舌象
		pulse_presentation: text("pulse_presentation"), // 脉象
		pathogenesis: text("pathogenesis"), // 病机分析
		treatment_principle: text("treatment_principle"), // 治法
		sort_order: integer("sort_order").notNull().default(0),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("syndromes_meridian_id_idx").on(table.meridian_id),
		index("syndromes_name_idx").on(table.name),
	]
);

// 方剂表
export const prescriptions = pgTable(
	"prescriptions",
	{
		id: serial().primaryKey(),
		syndrome_id: integer("syndrome_id").notNull().references(() => syndromes.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 100 }).notNull(), // 方剂名称
		composition: text("composition"), // 组成
		dosage: text("dosage"), // 用量
		preparation: text("preparation"), // 制法
		usage: text("usage"), // 用法
		effects: text("effects"), // 功效
		indications: text("indications"), // 主治
		contraindications: text("contraindications"), // 禁忌
		notes: text("notes"), // 备注
		sort_order: integer("sort_order").notNull().default(0),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("prescriptions_syndrome_id_idx").on(table.syndrome_id),
		index("prescriptions_name_idx").on(table.name),
	]
);

// 药材表
export const herbs = pgTable(
	"herbs",
	{
		id: serial().primaryKey(),
		name: varchar("name", { length: 100 }).notNull().unique(), // 药材名称
		pinyin_name: varchar("pinyin_name", { length: 100 }), // 拼音名
		category: varchar("category", { length: 50 }), // 药材分类
		properties: text("properties"), // 性味归经
		effects: text("effects"), // 功效
		indications: text("indications"), // 主治
		dosage: varchar("dosage", { length: 50 }), // 常用剂量
		contraindications: text("contraindications"), // 禁忌
		notes: text("notes"), // 备注
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("herbs_name_idx").on(table.name),
		index("herbs_category_idx").on(table.category),
	]
);

// 方剂药材关联表
export const prescriptionHerbs = pgTable(
	"prescription_herbs",
	{
		id: serial().primaryKey(),
		prescription_id: integer("prescription_id").notNull().references(() => prescriptions.id, { onDelete: "cascade" }),
		herb_id: integer("herb_id").notNull().references(() => herbs.id, { onDelete: "cascade" }),
		dosage: varchar("dosage", { length: 50 }), // 在本方中的用量
		preparation: varchar("preparation", { length: 100 }), // 炮制方法
		sort_order: integer("sort_order").notNull().default(0),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("prescription_herbs_prescription_id_idx").on(table.prescription_id),
		index("prescription_herbs_herb_id_idx").on(table.herb_id),
	]
);

// 六经传变关系表 - 记录每经的传变方向和截断方法
export const meridianTransmissions = pgTable(
	"meridian_transmissions",
	{
		id: serial().primaryKey(),
		source_meridian_id: integer("source_meridian_id").notNull().references(() => sixMeridians.id, { onDelete: "cascade" }),
		target_meridian_id: integer("target_meridian_id").notNull().references(() => sixMeridians.id, { onDelete: "cascade" }),
		transmission_type: varchar("transmission_type", { length: 50 }), // 传变类型：循经传、越经传、表里传
		warning_symptoms: text("warning_symptoms"), // 传变先兆症状
		interception_principle: text("interception_principle"), // 截断原则
		interception_method: text("interception_method"), // 截断方法
		herb_additions: text("herb_additions"), // 加减药物
		combined_prescription: text("combined_prescription"), // 合方名称
		combined_prescription_desc: text("combined_prescription_desc"), // 合方说明
		purpose: text("purpose"), // 截断目的
		sort_order: integer("sort_order").notNull().default(0),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("meridian_transmissions_source_idx").on(table.source_meridian_id),
		index("meridian_transmissions_target_idx").on(table.target_meridian_id),
	]
);

// 截断方剂表 - 记录传变截断的合方详情
export const interceptionPrescriptions = pgTable(
	"interception_prescriptions",
	{
		id: serial().primaryKey(),
		transmission_id: integer("transmission_id").notNull().references(() => meridianTransmissions.id, { onDelete: "cascade" }),
		syndrome_id: integer("syndrome_id").references(() => syndromes.id, { onDelete: "set null" }), // 关联的证型（可选）
		name: varchar("name", { length: 100 }).notNull(), // 合方名称
		base_prescription: varchar("base_prescription", { length: 100 }), // 基础方
		additional_herbs: text("additional_herbs"), // 加味药物
		composition: text("composition"), // 完整组成
		effects: text("effects"), // 功效
		indications: text("indications"), // 主治
		usage_notes: text("usage_notes"), // 使用注意
		interception_purpose: text("interception_purpose"), // 截断目的说明
		sort_order: integer("sort_order").notNull().default(0),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [
		index("interception_prescriptions_transmission_id_idx").on(table.transmission_id),
		index("interception_prescriptions_syndrome_id_idx").on(table.syndrome_id),
	]
);
