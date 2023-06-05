declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}
declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof AnyEntryMap> = AnyEntryMap[C][keyof AnyEntryMap[C]];

	// TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
	/**
	 * @deprecated
	 * `astro:content` no longer provide `image()`.
	 *
	 * Please use it through `schema`, like such:
	 * ```ts
	 * import { defineCollection, z } from "astro:content";
	 *
	 * defineCollection({
	 *   schema: ({ image }) =>
	 *     z.object({
	 *       image: image(),
	 *     }),
	 * });
	 * ```
	 */
	export const image: never;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<
				import('astro/zod').AnyZodObject,
				import('astro/zod').AnyZodObject
		  >;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"about": {
"index.md": {
	id: "index.md";
  slug: "index";
  body: string;
  collection: "about";
  data: any
} & { render(): Render[".md"] };
};
"authors": {
"-index.md": {
	id: "-index.md";
  slug: "-index";
  body: string;
  collection: "authors";
  data: InferEntrySchema<"authors">
} & { render(): Render[".md"] };
"dzung-nguyen.md": {
	id: "dzung-nguyen.md";
  slug: "dzung-nguyen";
  body: string;
  collection: "authors";
  data: InferEntrySchema<"authors">
} & { render(): Render[".md"] };
};
"pages": {
"404.md": {
	id: "404.md";
  slug: "404";
  body: string;
  collection: "pages";
  data: InferEntrySchema<"pages">
} & { render(): Render[".md"] };
"contact.md": {
	id: "contact.md";
  slug: "contact";
  body: string;
  collection: "pages";
  data: InferEntrySchema<"pages">
} & { render(): Render[".md"] };
"privacy-policy.md": {
	id: "privacy-policy.md";
  slug: "privacy-policy";
  body: string;
  collection: "pages";
  data: InferEntrySchema<"pages">
} & { render(): Render[".md"] };
};
"posts": {
"-index.md": {
	id: "-index.md";
  slug: "-index";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-01-21-What-is-rabbit-mq.md": {
	id: "2018-01-21-What-is-rabbit-mq.md";
  slug: "2018-01-21-what-is-rabbit-mq";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-01-21-python-decorator.md": {
	id: "2018-01-21-python-decorator.md";
  slug: "2018-01-21-python-decorator";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-01-21-python-xu-ly-mang-voi-filter-reduce.md": {
	id: "2018-01-21-python-xu-ly-mang-voi-filter-reduce.md";
  slug: "2018-01-21-python-xu-ly-mang-voi-filter-reduce";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-01-21-tim-hieu-oauth.md": {
	id: "2018-01-21-tim-hieu-oauth.md";
  slug: "2018-01-21-tim-hieu-oauth";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-01-21-truyen-tham-so-dong-python.md": {
	id: "2018-01-21-truyen-tham-so-dong-python.md";
  slug: "2018-01-21-truyen-tham-so-dong-python";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-02-09-tim-hieu-okr.md": {
	id: "2018-02-09-tim-hieu-okr.md";
  slug: "2018-02-09-tim-hieu-okr";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-04-11-blockchain.md": {
	id: "2018-04-11-blockchain.md";
  slug: "2018-04-11-blockchain";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-04-13-finite-state-machine-web-development.md": {
	id: "2018-04-13-finite-state-machine-web-development.md";
  slug: "2018-04-13-finite-state-machine-web-development";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-04-24-terminal-tips.md": {
	id: "2018-04-24-terminal-tips.md";
  slug: "2018-04-24-terminal-tips";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-05-01-what-is-mem-cache.md": {
	id: "2018-05-01-what-is-mem-cache.md";
  slug: "2018-05-01-what-is-mem-cache";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-05-02-Phoenix-local-ssl.md": {
	id: "2018-05-02-Phoenix-local-ssl.md";
  slug: "2018-05-02-phoenix-local-ssl";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-05-08-test-fb-bot-localhost.md": {
	id: "2018-05-08-test-fb-bot-localhost.md";
  slug: "2018-05-08-test-fb-bot-localhost";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-05-12-Erlang-term-storage.md": {
	id: "2018-05-12-Erlang-term-storage.md";
  slug: "2018-05-12-erlang-term-storage";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2018-05-17-ets-as-cache-phoenix.md": {
	id: "2018-05-17-ets-as-cache-phoenix.md";
  slug: "2018-05-17-ets-as-cache-phoenix";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2020-10-01parse-validate-data-with-tarams.md": {
	id: "2020-10-01parse-validate-data-with-tarams.md";
  slug: "2020-10-01parse-validate-data-with-tarams";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2020-10-30-compose-ecto-query-from-client.md": {
	id: "2020-10-30-compose-ecto-query-from-client.md";
  slug: "2020-10-30-compose-ecto-query-from-client";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-06-29-elixir-pattern-matching-in-a-nut-shell.md": {
	id: "2021-06-29-elixir-pattern-matching-in-a-nut-shell.md";
  slug: "2021-06-29-elixir-pattern-matching-in-a-nut-shell";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-06-30-elixir-for-beginner-all-you-need-to-know-about-guard.md": {
	id: "2021-06-30-elixir-for-beginner-all-you-need-to-know-about-guard.md";
  slug: "2021-06-30-elixir-for-beginner-all-you-need-to-know-about-guard";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-07-10-render-response-json-view.md": {
	id: "2021-07-10-render-response-json-view.md";
  slug: "2021-07-10-render-response-json-view";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-07-23-build-a-json-view-yourself.md": {
	id: "2021-07-23-build-a-json-view-yourself.md";
  slug: "2021-07-23-build-a-json-view-yourself";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-07-31-build-elixir-validator-from-scratch.md": {
	id: "2021-07-31-build-elixir-validator-from-scratch.md";
  slug: "2021-07-31-build-elixir-validator-from-scratch";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-08-06-valdi-elixir-validator.md": {
	id: "2021-08-06-valdi-elixir-validator.md";
  slug: "2021-08-06-valdi-elixir-validator";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-08-14-validate-request-params-with-phoenix.md": {
	id: "2021-08-14-validate-request-params-with-phoenix.md";
  slug: "2021-08-14-validate-request-params-with-phoenix";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-08-20-encrypt-data-with-ecto.md": {
	id: "2021-08-20-encrypt-data-with-ecto.md";
  slug: "2021-08-20-encrypt-data-with-ecto";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-08-26-jwt-auth-with-phoenix-token.md": {
	id: "2021-08-26-jwt-auth-with-phoenix-token.md";
  slug: "2021-08-26-jwt-auth-with-phoenix-token";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"2021-12-11-build-your-datetime-parser-in-elixir.md": {
	id: "2021-12-11-build-your-datetime-parser-in-elixir.md";
  slug: "2021-12-11-build-your-datetime-parser-in-elixir";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
"validate-request-params-phoenix-ecto.md": {
	id: "validate-request-params-phoenix-ecto.md";
  slug: "validate-request-params-phoenix-ecto";
  body: string;
  collection: "posts";
  data: InferEntrySchema<"posts">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
