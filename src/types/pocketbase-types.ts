/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	Category: "category",
	FrenchExpression: "french_expression",
	GeneralCulture: "general_culture",
	HandConfigurations: "hand_configurations",
	LexicalField: "lexical_field",
	LexicalTerm: "lexical_term",
	Person: "person",
	PersonCountPerCategory: "person_count_per_category",
	PiDeafExpression: "pi_deaf_expression",
	Quiz: "quiz",
	QuizAttempt: "quiz_attempt",
	QuizCounts: "quiz_counts",
	QuizItem: "quiz_item",
	QuizSession: "quiz_session",
	Roles: "roles",
	Sign: "sign",
	SignCountPerCategory: "sign_count_per_category",
	Users: "users",
	Video: "video",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export const CategoryEntitiesOptions = {
	"person": "person",
	"activity": "activity",
	"lexical_field": "lexical_field",
	"lexical_term": "lexical_term",
} as const
export type CategoryEntitiesOptions = typeof CategoryEntitiesOptions[keyof typeof CategoryEntitiesOptions]
export type CategoryRecord = {
	Parent?: RecordIdString
	created: IsoAutoDateString
	entities?: CategoryEntitiesOptions[]
	id: string
	slug?: string
	tag?: string
	updated: IsoAutoDateString
}

export type FrenchExpressionRecord = {
	Roles?: RecordIdString[]
	Signs?: RecordIdString[]
	created: IsoAutoDateString
	expression: string
	id: string
	slug?: string
	strategies?: string
	updated: IsoAutoDateString
}

export type GeneralCultureRecord = {
	LexicalFields?: RecordIdString[]
	Persons?: RecordIdString[]
	Roles?: RecordIdString[]
	Signs?: RecordIdString[]
	created: IsoAutoDateString
	description?: string
	end_date?: string
	id: string
	images?: FileNameString[]
	name: string
	slug?: string
	start_date: string
	updated: IsoAutoDateString
}

export type HandConfigurationsRecord = {
	created: IsoAutoDateString
	id: string
	illustration?: FileNameString
	name?: string
	updated: IsoAutoDateString
}

export type LexicalFieldRecord = {
	Categories?: RecordIdString[]
	Roles?: RecordIdString[]
	created: IsoAutoDateString
	id: string
	introduction?: string
	name: string
	slug?: string
	updated: IsoAutoDateString
}

export type LexicalTermRecord = {
	LexicalField: RecordIdString
	RelatedTerms?: RecordIdString[]
	Sign?: RecordIdString
	Type?: RecordIdString
	created: IsoAutoDateString
	id: string
	note?: string
	strategy?: string
	term: string
	updated: IsoAutoDateString
}

export type PersonRecord<Trewards = unknown, Ttimeline = unknown> = {
	Activities?: RecordIdString[]
	Category?: RecordIdString[]
	Roles?: RecordIdString[]
	Sign?: RecordIdString
	Videos?: RecordIdString[]
	birthdate?: IsoDateString
	birthplace?: string
	created: IsoAutoDateString
	deaf?: boolean
	deafFamily?: boolean
	deathdate?: IsoDateString
	deceased?: boolean
	description?: string
	family?: string
	firstname?: string
	id: string
	illustration?: FileNameString
	name?: string
	organism?: boolean
	rewards?: null | Trewards
	slug?: string
	timeline?: null | Ttimeline
	updated: IsoAutoDateString
}

export type PersonCountPerCategoryRecord<Tcategory_id = unknown, Trole_id = unknown> = {
	category_id?: null | Tcategory_id
	id: string
	person_count?: number
	role_id?: null | Trole_id
}

export type PiDeafExpressionRecord = {
	Roles?: RecordIdString[]
	Sign: RecordIdString
	created: IsoAutoDateString
	id: string
	name?: string
	slug?: string
	strategies?: string
	updated: IsoAutoDateString
}

export const QuizItemTypeOptions = {
	"sign": "sign",
	"person": "person",
	"mixed": "mixed",
} as const
export type QuizItemTypeOptions = typeof QuizItemTypeOptions[keyof typeof QuizItemTypeOptions]
export type QuizRecord<Tsettings = unknown> = {
	Owner: RecordIdString
	created: IsoAutoDateString
	description?: HTMLString
	id: string
	item_type: QuizItemTypeOptions
	settings?: null | Tsettings
	shared_with_users?: RecordIdString[]
	title: string
	updated: IsoAutoDateString
}

export const QuizAttemptResultOptions = {
	"known": "known",
	"unknown": "unknown",
	"skip": "skip",
} as const
export type QuizAttemptResultOptions = typeof QuizAttemptResultOptions[keyof typeof QuizAttemptResultOptions]
export type QuizAttemptRecord = {
	QuizItem: RecordIdString
	Session: RecordIdString
	created: IsoAutoDateString
	id: string
	result: QuizAttemptResultOptions
	time_spent?: number
	updated: IsoAutoDateString
}

export type QuizCountsRecord = {
	Owner: RecordIdString
	id: string
	items_count?: number
	items_count_person?: number
	items_count_sign?: number
	shared_with_users?: RecordIdString[]
}

export const QuizItemItemTypeOptions = {
	"sign": "sign",
	"person": "person",
} as const
export type QuizItemItemTypeOptions = typeof QuizItemItemTypeOptions[keyof typeof QuizItemItemTypeOptions]
export type QuizItemRecord = {
	Quiz: RecordIdString
	created: IsoAutoDateString
	id: string
	item_id: string
	item_type: QuizItemItemTypeOptions
	position: number
	updated: IsoAutoDateString
}

export type QuizSessionRecord<Tsettings_snapshot = unknown, Tstats = unknown> = {
	Quiz: RecordIdString
	User: RecordIdString
	completed_at?: IsoDateString
	config_key: string
	created: IsoAutoDateString
	id: string
	settings_snapshot?: null | Tsettings_snapshot
	started_at: IsoDateString
	stats?: null | Tstats
	updated: IsoAutoDateString
}

export type RolesRecord = {
	created: IsoAutoDateString
	id: string
	name?: string
	slug?: string
	updated: IsoAutoDateString
}

export const SignLevelOptions = {
	"a1": "a1",
	"a2": "a2",
	"b1": "b1",
	"b2": "b2",
	"c1": "c1",
} as const
export type SignLevelOptions = typeof SignLevelOptions[keyof typeof SignLevelOptions]

export const SignPrimaryLanguageOptions = {
	"LSF": "LSF",
	"LSR": "LSR",
	"ASL": "ASL",
	"LSI": "LSI",
	"BSL": "BSL",
	"ISL": "ISL",
	"other": "other",
} as const
export type SignPrimaryLanguageOptions = typeof SignPrimaryLanguageOptions[keyof typeof SignPrimaryLanguageOptions]

export const SignLearningSourceOptions = {
	"dictionary": "dictionary",
	"teacher": "teacher",
	"community": "community",
	"media": "media",
	"other": "other",
} as const
export type SignLearningSourceOptions = typeof SignLearningSourceOptions[keyof typeof SignLearningSourceOptions]

export const SignVerificationStatusOptions = {
	"verified": "verified",
	"unverified": "unverified",
	"disputed": "disputed",
} as const
export type SignVerificationStatusOptions = typeof SignVerificationStatusOptions[keyof typeof SignVerificationStatusOptions]
export type SignRecord<Tplacement = unknown> = {
	Category?: RecordIdString[]
	ConfigurationLeft?: RecordIdString
	ConfigurationRight?: RecordIdString
	Roles?: RecordIdString[]
	created: IsoAutoDateString
	definition?: string
	id: string
	learning_source?: SignLearningSourceOptions
	learning_source_detail?: string
	level?: SignLevelOptions
	name?: string
	placement?: null | Tplacement
	primary_language?: SignPrimaryLanguageOptions
	slug?: string
	updated: IsoAutoDateString
	verification_status?: SignVerificationStatusOptions
	video?: FileNameString
}

export type SignCountPerCategoryRecord<Tcategory_id = unknown, Trole_id = unknown> = {
	category_id?: null | Tcategory_id
	id: string
	role_id?: null | Trole_id
	sign_count?: number
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	roles?: RecordIdString[]
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type VideoRecord = {
	created: IsoAutoDateString
	id: string
	title?: string
	updated: IsoAutoDateString
	url?: string
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type CategoryResponse<Texpand = unknown> = Required<CategoryRecord> & BaseSystemFields<Texpand>
export type FrenchExpressionResponse<Texpand = unknown> = Required<FrenchExpressionRecord> & BaseSystemFields<Texpand>
export type GeneralCultureResponse<Texpand = unknown> = Required<GeneralCultureRecord> & BaseSystemFields<Texpand>
export type HandConfigurationsResponse<Texpand = unknown> = Required<HandConfigurationsRecord> & BaseSystemFields<Texpand>
export type LexicalFieldResponse<Texpand = unknown> = Required<LexicalFieldRecord> & BaseSystemFields<Texpand>
export type LexicalTermResponse<Texpand = unknown> = Required<LexicalTermRecord> & BaseSystemFields<Texpand>
export type PersonResponse<Trewards = unknown, Ttimeline = unknown, Texpand = unknown> = Required<PersonRecord<Trewards, Ttimeline>> & BaseSystemFields<Texpand>
export type PersonCountPerCategoryResponse<Tcategory_id = unknown, Trole_id = unknown, Texpand = unknown> = Required<PersonCountPerCategoryRecord<Tcategory_id, Trole_id>> & BaseSystemFields<Texpand>
export type PiDeafExpressionResponse<Texpand = unknown> = Required<PiDeafExpressionRecord> & BaseSystemFields<Texpand>
export type QuizResponse<Tsettings = unknown, Texpand = unknown> = Required<QuizRecord<Tsettings>> & BaseSystemFields<Texpand>
export type QuizAttemptResponse<Texpand = unknown> = Required<QuizAttemptRecord> & BaseSystemFields<Texpand>
export type QuizCountsResponse<Texpand = unknown> = Required<QuizCountsRecord> & BaseSystemFields<Texpand>
export type QuizItemResponse<Texpand = unknown> = Required<QuizItemRecord> & BaseSystemFields<Texpand>
export type QuizSessionResponse<Tsettings_snapshot = unknown, Tstats = unknown, Texpand = unknown> = Required<QuizSessionRecord<Tsettings_snapshot, Tstats>> & BaseSystemFields<Texpand>
export type RolesResponse<Texpand = unknown> = Required<RolesRecord> & BaseSystemFields<Texpand>
export type SignResponse<Tplacement = unknown, Texpand = unknown> = Required<SignRecord<Tplacement>> & BaseSystemFields<Texpand>
export type SignCountPerCategoryResponse<Tcategory_id = unknown, Trole_id = unknown, Texpand = unknown> = Required<SignCountPerCategoryRecord<Tcategory_id, Trole_id>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type VideoResponse<Texpand = unknown> = Required<VideoRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	category: CategoryRecord
	french_expression: FrenchExpressionRecord
	general_culture: GeneralCultureRecord
	hand_configurations: HandConfigurationsRecord
	lexical_field: LexicalFieldRecord
	lexical_term: LexicalTermRecord
	person: PersonRecord
	person_count_per_category: PersonCountPerCategoryRecord
	pi_deaf_expression: PiDeafExpressionRecord
	quiz: QuizRecord
	quiz_attempt: QuizAttemptRecord
	quiz_counts: QuizCountsRecord
	quiz_item: QuizItemRecord
	quiz_session: QuizSessionRecord
	roles: RolesRecord
	sign: SignRecord
	sign_count_per_category: SignCountPerCategoryRecord
	users: UsersRecord
	video: VideoRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	category: CategoryResponse
	french_expression: FrenchExpressionResponse
	general_culture: GeneralCultureResponse
	hand_configurations: HandConfigurationsResponse
	lexical_field: LexicalFieldResponse
	lexical_term: LexicalTermResponse
	person: PersonResponse
	person_count_per_category: PersonCountPerCategoryResponse
	pi_deaf_expression: PiDeafExpressionResponse
	quiz: QuizResponse
	quiz_attempt: QuizAttemptResponse
	quiz_counts: QuizCountsResponse
	quiz_item: QuizItemResponse
	quiz_session: QuizSessionResponse
	roles: RolesResponse
	sign: SignResponse
	sign_count_per_category: SignCountPerCategoryResponse
	users: UsersResponse
	video: VideoResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
