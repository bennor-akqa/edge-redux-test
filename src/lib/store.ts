import { configureStore, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery, setupListeners } from "@reduxjs/toolkit/query/react";
import { Action, combineReducers, UnknownAction } from "redux";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import logger from "redux-logger";
import graphqlRequestBaseQuery from "./graphql";
import { useStore } from "react-redux";

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
  extractRehydrationInfo,
  endpoints: (builder) => ({
    getIP: builder.query<IPState, void>({
      query: () => `/ip`,
    }),
  }),  
});

export const { useGetIPQuery } = systemApi;

// API approach
export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://pokeapi.co/api/v2" }),
  extractRehydrationInfo,
  endpoints: (builder) => ({
    getPokemonByName: builder.query<Pokemon, string>({
      query: (name) => `/pokemon/${name}`,
      transformResponse: ({ id, name }: any) => ({
        id,
        name,
      }),
    }),
  }),
});

export const { useGetPokemonByNameQuery } = pokemonApi;

export interface Country {
  code: string;
  name: string;
  currency: string;
  phone: string;
}

export const countriesApi = createApi({
  reducerPath: "countriesApi",
  baseQuery: graphqlRequestBaseQuery({
    baseUrl: "https://countries.trevorblades.com/graphql",
  }),
  extractRehydrationInfo,
  endpoints: (builder) => ({
    getCountry: builder.query<Country | undefined, string>({
      query: (code) => ({
        body: `
          query getCountry($code: ID!) {
            country(code: $code) {
              code
              name
              currency
              phone
            }
          }
        `,
        variables: {
          code,
        },
      }),
      transformResponse: (data: { country?: Country }) => {
        console.log("getCountry", { data });
        return data.country as Country;
      },
    }),
  }),
});

export const { useGetCountryQuery } = countriesApi;

// Store setup
const reducers = {
  [systemApi.reducerPath]: systemApi.reducer,
  [pokemonApi.reducerPath]: pokemonApi.reducer,
  [countriesApi.reducerPath]: countriesApi.reducer,
};

const reducer = combineReducers(reducers);

const makeStore = ({ reduxWrapperMiddleware }: any) =>
  {
    const store = configureStore({
      reducer,
      devTools: true,
      middleware: (getDefaultMiddleware) => getDefaultMiddleware()
        .concat([
          process.browser ? logger : null,
          systemApi.middleware,
          pokemonApi.middleware,
          countriesApi.middleware,
          reduxWrapperMiddleware,
        ])
        .filter(Boolean) as any,
    });
    setupListeners(store.dispatch)
    return store
  };

type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const useAppStore = useStore<AppState>

export const wrapper = createWrapper<AppStore>(makeStore, { debug: false });
