import {
  configureStore,
  createSelector,
  createSlice,
  PayloadAction,
  ThunkAction,
} from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Action, combineReducers } from "redux";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import logger from "redux-logger";

interface IPState {
  origin: string;
}

interface Pokemon {
  id: number;
  name: string;
}

function isHydrateAction(action: Action): action is PayloadAction<any> {
  return action.type === HYDRATE;
}

export const systemApi = createApi({
  reducerPath: "systemApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://httpbin.org" }),

  endpoints: (builder) => ({
    getIP: builder.query<IPState, void>({
      query: () => `/ip`,
    }),
  }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (isHydrateAction(action)) {
      return action.payload[reducerPath];
    }
  },
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
  extractRehydrationInfo(action, { reducerPath }) {
    if (isHydrateAction(action)) {
      return action.payload[reducerPath];
    }
  },
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
