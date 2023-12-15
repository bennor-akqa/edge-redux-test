import React from 'react';
import {wrapper, pokemonApi, useGetPokemonByNameQuery} from '@/lib/store';
import {useStore} from 'react-redux';

export default function Pokemon(props: any) {
    // wrapper.useHydration(props);

    console.log('State on render', useStore().getState());
    const {data} = useGetPokemonByNameQuery('pikachu'); // data is undefined for the first render

    if (!data) {
        return <div>Loading</div>;
    }

    return <div>Name: {data?.name}</div>;
}

export const getServerSideProps = wrapper.getServerSideProps(store => async context => {
    const pokemon = 'pikachu';
    if (typeof pokemon === 'string') {
        console.log('DISPATCH');
        store.dispatch(pokemonApi.endpoints.getPokemonByName.initiate(pokemon));
    }

    await Promise.all(store.dispatch(pokemonApi.util.getRunningQueriesThunk()));

    console.log('SERVER STATE', store.getState().pokemonApi);

    return {
        props: {},
    };
});

export const config = {
    runtime: 'experimental-edge'
}