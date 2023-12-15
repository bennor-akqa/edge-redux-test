import {
  configureStore,
  createSelector,
  createSlice,
  PayloadAction,
  ThunkAction,
} from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Action, combineReducers } from "redux";
import { createWrapper } from "next-redux-wrapper";
import logger from "redux-logger";

// System model
interface SystemData {
  source: string;
}

interface SystemState {
  data: SystemData | null;
}

const initialSystemState: SystemState = {
  data: null,
};

// Subject page slice approach
const systemSlice = createSlice({
  name: "system",
  initialState: initialSystemState,
  reducers: {
    systemLoaded(state, { payload }: PayloadAction<SystemState>) {
      state.data = payload.data;
    },
  },
});

interface Pokemon {
  id: number;
  name: string;
}

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
});

export const { useGetPokemonByNameQuery } = pokemonApi;

// Store setup
const reducers = {
  [systemSlice.name]: systemSlice.reducer,
  [pokemonApi.reducerPath]: pokemonApi.reducer,
};

const reducer = combineReducers(reducers);

const makeStore = ({reduxWrapperMiddleware}: any) =>
  configureStore({
    reducer,
    devTools: true,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
        process.browser ? logger : null,
        pokemonApi.middleware,
        reduxWrapperMiddleware
      ]).filter(Boolean) as any,
  });

type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore, { debug: true });

// System thunk
export const fetchSystem = (): AppThunk => async (dispatch) => {
  const timeoutPromise = (timeout: number) =>
    new Promise((resolve) => setTimeout(resolve, timeout));

  await timeoutPromise(200);

  dispatch(
    systemSlice.actions.systemLoaded({
      data: {
        source: "GIAP",
      },
    })
  );
};

// System selectors
const systemSliceSelector = (state: AppState): SystemState => state?.system;

const selectSystemData = createSelector(systemSliceSelector, (s) => s.data);

export const selectSystemSource = createSelector(
  selectSystemData,
  (s) => s?.source
);
