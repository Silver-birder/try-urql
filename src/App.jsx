import React from "react";
import { pipe, tap } from "wonka";
import {
  createClient,
  Provider,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  debugExchange,
} from "urql";

import PokemonList from "./PokemonList";

const customExchange = ({ forward }) => {
  return (operations$) => {
    return forward(
      pipe(
        operations$,
        tap((op) => {
          console.log({ op });
          return op;
        })
      )
    );
  };
};

const client = createClient({
  url: "https://trygql.formidable.dev/graphql/basic-pokedex",
  exchanges: [
    dedupExchange,
    cacheExchange,
    fetchExchange,
    debugExchange,
    customExchange,
  ],
});

function App() {
  return (
    <Provider value={client}>
      <PokemonList />
    </Provider>
  );
}

export default App;
