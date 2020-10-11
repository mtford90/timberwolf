import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
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
  DateTime: any;
  Date: any;
  Time: any;
};




export type Source = {
  __typename: 'Source';
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
};

export type Log = {
  __typename: 'Log';
  source: Source;
  text: Scalars['String'];
  rowid: Scalars['Int'];
  timestamp: Scalars['DateTime'];
};

export type SystemInfo = {
  __typename: 'SystemInfo';
  darkModeEnabled: Scalars['Boolean'];
  websocketPort?: Maybe<Scalars['Int']>;
  executablePath: Scalars['String'];
};

export enum SystemEvent {
  NewTab = 'NEW_TAB',
  CloseTab = 'CLOSE_TAB',
  NewWindow = 'NEW_WINDOW'
}

export type Query = {
  __typename: 'Query';
  numCpus: Scalars['Int'];
  logs: Array<Log>;
  source: Array<Source>;
  numLogs: Scalars['Int'];
  suggest: Array<Scalars['String']>;
  systemInfo: SystemInfo;
};


export type QueryLogsArgs = {
  sourceId: Scalars['String'];
  limit: Scalars['Int'];
  beforeRowId?: Maybe<Scalars['Int']>;
  filter?: Maybe<Scalars['String']>;
};


export type QueryNumLogsArgs = {
  source: Scalars['String'];
  beforeRowId?: Maybe<Scalars['Int']>;
  filter?: Maybe<Scalars['String']>;
};


export type QuerySuggestArgs = {
  source: Scalars['String'];
  prefix: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type Subscription = {
  __typename: 'Subscription';
  logs?: Maybe<Log>;
  systemInfo?: Maybe<SystemInfo>;
  systemEvent?: Maybe<SystemEvent>;
};


export type SubscriptionLogsArgs = {
  sourceId?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
};

export type SourceInput = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type Mutation = {
  __typename: 'Mutation';
  createSource?: Maybe<Source>;
  renameSource?: Maybe<Source>;
  deleteSource: Scalars['String'];
};


export type MutationCreateSourceArgs = {
  source: SourceInput;
};


export type MutationRenameSourceArgs = {
  sourceId: Scalars['String'];
  name: Scalars['String'];
};


export type MutationDeleteSourceArgs = {
  sourceId: Scalars['String'];
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

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

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
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Time: ResolverTypeWrapper<Scalars['Time']>;
  Source: ResolverTypeWrapper<Source>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Log: ResolverTypeWrapper<Log>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  SystemInfo: ResolverTypeWrapper<SystemInfo>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  SystemEvent: SystemEvent;
  Query: ResolverTypeWrapper<{}>;
  Subscription: ResolverTypeWrapper<{}>;
  SourceInput: SourceInput;
  Mutation: ResolverTypeWrapper<{}>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  DateTime: Scalars['DateTime'];
  Date: Scalars['Date'];
  Time: Scalars['Time'];
  Source: Source;
  String: Scalars['String'];
  Log: Log;
  Int: Scalars['Int'];
  SystemInfo: SystemInfo;
  Boolean: Scalars['Boolean'];
  Query: {};
  Subscription: {};
  SourceInput: SourceInput;
  Mutation: {};
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface TimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Time'], any> {
  name: 'Time';
}

export type SourceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Source'] = ResolversParentTypes['Source']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LogResolvers<ContextType = any, ParentType extends ResolversParentTypes['Log'] = ResolversParentTypes['Log']> = {
  source?: Resolver<ResolversTypes['Source'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rowid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SystemInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['SystemInfo'] = ResolversParentTypes['SystemInfo']> = {
  darkModeEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  websocketPort?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  executablePath?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  numCpus?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  logs?: Resolver<Array<ResolversTypes['Log']>, ParentType, ContextType, RequireFields<QueryLogsArgs, 'sourceId' | 'limit'>>;
  source?: Resolver<Array<ResolversTypes['Source']>, ParentType, ContextType>;
  numLogs?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryNumLogsArgs, 'source'>>;
  suggest?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QuerySuggestArgs, 'source' | 'prefix'>>;
  systemInfo?: Resolver<ResolversTypes['SystemInfo'], ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  logs?: SubscriptionResolver<Maybe<ResolversTypes['Log']>, "logs", ParentType, ContextType, RequireFields<SubscriptionLogsArgs, never>>;
  systemInfo?: SubscriptionResolver<Maybe<ResolversTypes['SystemInfo']>, "systemInfo", ParentType, ContextType>;
  systemEvent?: SubscriptionResolver<Maybe<ResolversTypes['SystemEvent']>, "systemEvent", ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createSource?: Resolver<Maybe<ResolversTypes['Source']>, ParentType, ContextType, RequireFields<MutationCreateSourceArgs, 'source'>>;
  renameSource?: Resolver<Maybe<ResolversTypes['Source']>, ParentType, ContextType, RequireFields<MutationRenameSourceArgs, 'sourceId' | 'name'>>;
  deleteSource?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteSourceArgs, 'sourceId'>>;
};

export type Resolvers<ContextType = any> = {
  DateTime?: GraphQLScalarType;
  Date?: GraphQLScalarType;
  Time?: GraphQLScalarType;
  Source?: SourceResolvers<ContextType>;
  Log?: LogResolvers<ContextType>;
  SystemInfo?: SystemInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
