import {
  configureStore,
  createSelector,
  createSlice,
  PayloadAction,
  ThunkAction,
} from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Action, combineReducers, UnknownAction } from "redux";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import logger from "redux-logger";

export interface IPState {
  origin: string;
}

export interface Pokemon {
  id: number;
  name: string;
}

function extractRehydrationInfo(
  action: UnknownAction,
  { reducerPath }: { reducerPath: string }
) {
  if (action.type === HYDRATE) {
    const { payload } = action as PayloadAction<any>;
    // if (payload.app === 'init') delete payload.app;
    // if (payload.page === 'init') delete payload.page;
    return payload[reducerPath];
  }
}

export const systemApi = createApi({
  reducerPath: "systemApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://httpbin.org" }),

  endpoints: (builder) => ({
    getIP: builder.query<IPState, void>({
      query: () => `/ip`,
    }),
  }),
  extractRehydrationInfo,
});

export const { useGetIPQuery } = systemApi;

// API approach
export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://pokeapi.co/api/v2" }),
  endpoints: (builder) => ({
    getPokemonByName: builder.query<Pokemon, string>({
      query: (name) => `/pokemon/${name}`,
      transformResponse: ({ id, name }: any) => ({
        id,
        name,
      }),
    }),
  }),
  extractRehydrationInfo,
});

export const { useGetPokemonByNameQuery } = pokemonApi;

// Store setup
const reducers = {
  [systemApi.reducerPath]: systemApi.reducer,
  [pokemonApi.reducerPath]: pokemonApi.reducer,
};

const reducer = combineReducers(reducers);

const makeStore = ({ reduxWrapperMiddleware }: any) =>
  configureStore({
    reducer,
    devTools: true,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat([
          process.browser ? logger : null,
          systemApi.middleware,
          pokemonApi.middleware,
          reduxWrapperMiddleware,
        ])
        .filter(Boolean) as any,
  });

type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore, { debug: true });
