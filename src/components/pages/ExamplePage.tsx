import {
  useGetPokemonByNameQuery,
  useGetCountryQuery,
  wrapper,
  pokemonApi,
  countriesApi,
  useAppStore,
} from "@/lib/store";
import { InferGetServerSidePropsType } from "next";

export default function ExamplePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const state = useAppStore().getState()
  console.log(
    "RENDER STATE",
    JSON.stringify(state.countriesApi, null, 2)
  );
  const { data: pokemon } = useGetPokemonByNameQuery(props.pokemon); // data is undefined for the first render
  const { data: country } = useGetCountryQuery(props.countryCode);

  if (!pokemon || !country) {
    return <div>Loading</div>;
  }

  return (
    <>
      <div>Pokemon: {pokemon?.name}</div>
      <div>
        Country: {country?.name} ({country.code})
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (_context) => {
    const pokemon = "pikachu";
    store.dispatch<any>(
      pokemonApi.endpoints.getPokemonByName.initiate(pokemon)
    );

    const countryCode = "AU";
    store.dispatch<any>(
      countriesApi.endpoints.getCountry.initiate(countryCode)
    );

    await Promise.all([
      ...store.dispatch<any>(pokemonApi.util.getRunningQueriesThunk()),
      ...store.dispatch<any>(countriesApi.util.getRunningQueriesThunk()),
    ]);

    console.log("SERVER STATE", JSON.stringify(store.getState().countriesApi, null, 2));

    return {
      props: {
        pokemon,
        countryCode,
      },
    };
  }
);
