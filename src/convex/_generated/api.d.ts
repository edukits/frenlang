/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as content_courses from "../content/courses.js";
import type * as content_ingest from "../content/ingest.js";
import type * as content_items from "../content/items.js";
import type * as content_lessons from "../content/lessons.js";
import type * as content_units from "../content/units.js";
import type * as gamification from "../gamification.js";
import type * as http from "../http.js";
import type * as learn from "../learn.js";
import type * as profiles from "../profiles.js";
import type * as shared from "../shared.js";
import type * as srs from "../srs.js";
import type * as topics from "../topics.js";
import type * as users from "../users.js";
import type * as vocabulary from "../vocabulary.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "content/courses": typeof content_courses;
  "content/ingest": typeof content_ingest;
  "content/items": typeof content_items;
  "content/lessons": typeof content_lessons;
  "content/units": typeof content_units;
  gamification: typeof gamification;
  http: typeof http;
  learn: typeof learn;
  profiles: typeof profiles;
  shared: typeof shared;
  srs: typeof srs;
  topics: typeof topics;
  users: typeof users;
  vocabulary: typeof vocabulary;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
