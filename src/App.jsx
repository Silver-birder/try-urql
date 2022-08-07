import React from "react";
import {
  createClient,
  Provider,
  cacheExchange,
  dedupExchange,
  fetchExchange,
} from "urql";
import { pipe, tap, map } from "wonka";

import PokemonList from "./PokemonList";

export const debugExchange = ({ forward }) => {
  if (process.env.NODE_ENV === "production") {
    return (ops$) => forward(ops$);
  } else {
    return (ops$) =>
      pipe(
        ops$,
        tap((op) => console.log("[Exchange debug]: Incoming operation: ", op)),
        forward,
        tap((result) => {
          console.log("[Exchange debug]: Completed operation: ", result);
        }),
        map((result) => {
          result.data.pokemons = result.data.pokemons.map((p) => {
            return { a: 1 };
          });
          return result;
        })
      );
  }
};

const client = createClient({
  url: "https://trygql.formidable.dev/graphql/basic-pokedex",
  exchanges: [dedupExchange, cacheExchange, debugExchange, fetchExchange],
  suspense: true,
});

function App() {
  return (
    <Provider value={client}>
      <PokemonList />
    </Provider>
  );
}

export default App;
