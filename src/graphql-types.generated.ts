import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type IndexResult = {
  __typename: 'IndexResult';
  ok: Scalars['Boolean'];
};

export type Mutation = {
  __typename: 'Mutation';
  index: IndexResult;
};


export type MutationIndexArgs = {
  path: Scalars['String'];
};

export type ReadFileResponse = {
  __typename: 'ReadFileResponse';
  data?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename: 'Query';
  numCpus: Scalars['Int'];
  stdin: Array<Scalars['String']>;
  progress: Array<IndexingProgressEvent>;
};

export type IndexingProgressEvent = {
  __typename: 'IndexingProgressEvent';
  totalBytes: Scalars['Int'];
  bytesRead: Scalars['Int'];
  path: Scalars['String'];
};

export type IndexingErrorEvent = {
  __typename: 'IndexingErrorEvent';
  path: Scalars['String'];
  description: Scalars['String'];
};

export type IndexingCloseEvent = {
  __typename: 'IndexingCloseEvent';
  path: Scalars['String'];
};

export type IndexingEvent = IndexingProgressEvent | IndexingCloseEvent | IndexingErrorEvent;

export type Subscription = {
  __typename: 'Subscription';
  stdin: Scalars['String'];
  fileOpen: Array<Scalars['String']>;
  indexing: IndexingEvent;
};



export type ResolverTypeWrapper<T> = T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  IndexResult: ResolverTypeWrapper<IndexResult>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Mutation: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  ReadFileResponse: ResolverTypeWrapper<ReadFileResponse>;
  Query: ResolverTypeWrapper<{}>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  IndexingProgressEvent: ResolverTypeWrapper<IndexingProgressEvent>;
  IndexingErrorEvent: ResolverTypeWrapper<IndexingErrorEvent>;
  IndexingCloseEvent: ResolverTypeWrapper<IndexingCloseEvent>;
  IndexingEvent: ResolversTypes['IndexingProgressEvent'] | ResolversTypes['IndexingCloseEvent'] | ResolversTypes['IndexingErrorEvent'];
  Subscription: ResolverTypeWrapper<{}>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  IndexResult: IndexResult;
  Boolean: Scalars['Boolean'];
  Mutation: {};
  String: Scalars['String'];
  ReadFileResponse: ReadFileResponse;
  Query: {};
  Int: Scalars['Int'];
  IndexingProgressEvent: IndexingProgressEvent;
  IndexingErrorEvent: IndexingErrorEvent;
  IndexingCloseEvent: IndexingCloseEvent;
  IndexingEvent: ResolversParentTypes['IndexingProgressEvent'] | ResolversParentTypes['IndexingCloseEvent'] | ResolversParentTypes['IndexingErrorEvent'];
  Subscription: {};
};

export type IndexResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['IndexResult'] = ResolversParentTypes['IndexResult']> = {
  ok?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  index?: Resolver<ResolversTypes['IndexResult'], ParentType, ContextType, RequireFields<MutationIndexArgs, 'path'>>;
};

export type ReadFileResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReadFileResponse'] = ResolversParentTypes['ReadFileResponse']> = {
  data?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  numCpus?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stdin?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  progress?: Resolver<Array<ResolversTypes['IndexingProgressEvent']>, ParentType, ContextType>;
};

export type IndexingProgressEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['IndexingProgressEvent'] = ResolversParentTypes['IndexingProgressEvent']> = {
  totalBytes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  bytesRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  path?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type IndexingErrorEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['IndexingErrorEvent'] = ResolversParentTypes['IndexingErrorEvent']> = {
  path?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type IndexingCloseEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['IndexingCloseEvent'] = ResolversParentTypes['IndexingCloseEvent']> = {
  path?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type IndexingEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['IndexingEvent'] = ResolversParentTypes['IndexingEvent']> = {
  __resolveType: TypeResolveFn<'IndexingProgressEvent' | 'IndexingCloseEvent' | 'IndexingErrorEvent', ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  stdin?: SubscriptionResolver<ResolversTypes['String'], "stdin", ParentType, ContextType>;
  fileOpen?: SubscriptionResolver<Array<ResolversTypes['String']>, "fileOpen", ParentType, ContextType>;
  indexing?: SubscriptionResolver<ResolversTypes['IndexingEvent'], "indexing", ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  IndexResult?: IndexResultResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  ReadFileResponse?: ReadFileResponseResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  IndexingProgressEvent?: IndexingProgressEventResolvers<ContextType>;
  IndexingErrorEvent?: IndexingErrorEventResolvers<ContextType>;
  IndexingCloseEvent?: IndexingCloseEventResolvers<ContextType>;
  IndexingEvent?: IndexingEventResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
