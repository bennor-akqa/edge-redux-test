import React from "react";
import { wrapper, pokemonApi, useGetPokemonByNameQuery } from "@/lib/store";
import { useStore } from "react-redux";
import { InferGetServerSidePropsType } from "next";

export default function Pokemon(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

  console.log("State on render", useStore().getState());
  const { data } = useGetPokemonByNameQuery(props.pokemon); // data is undefined for the first render

  if (!data) {
    return <div>Loading</div>;
  }

  return <div>Name: {data?.name}</div>;
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (context) => {
    const pokemon = "pikachu";
    store.dispatch<any>(
      pokemonApi.endpoints.getPokemonByName.initiate(pokemon)
    );

    await Promise.all(
      store.dispatch<any>(pokemonApi.util.getRunningQueriesThunk())
    );

    console.log("SERVER STATE", store.getState().pokemonApi);

    return {
      props: {
        pokemon
      },
    };
  }
);
