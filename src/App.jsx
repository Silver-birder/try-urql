import React from "react";
import { createClient, Provider, fetchExchange } from "urql";
import { customExchange, simpleExchange } from "./exchange";

import PokemonList from "./PokemonList";

const client = createClient({
  url: "https://trygql.formidable.dev/graphql/basic-pokedex",
  exchanges: [fetchExchange, simpleExchange, customExchange],
  maskTypename: true, // but, contain __typename ...
});

function App() {
  return (
    <Provider value={client}>
      <PokemonList />
    </Provider>
  );
}

export default App;
