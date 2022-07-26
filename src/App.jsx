import React from "react";
import { pipe, filter, merge, share, map } from "wonka";
import { createClient, Provider, dedupExchange, fetchExchange } from "urql";

import PokemonList from "./PokemonList";

const noopExchange = ({ client, forward }) => {
  return (operations$) => {
    const shared = pipe(operations$, share);
    const queries = pipe(
      shared,
      filter((op) => op.kind === "query"),
      map((op) => {
        console.log("map", { op });
        return op;
      })
    );
    const others = pipe(
      shared,
      filter((op) => op.kind !== "query")
    );
    return forward(merge([queries, others]));
  };
};

const client = createClient({
  url: "https://trygql.formidable.dev/graphql/basic-pokedex",
  exchanges: [dedupExchange, noopExchange, fetchExchange],
});

function App() {
  return (
    <Provider value={client}>
      <PokemonList />
    </Provider>
  );
}

export default App;
