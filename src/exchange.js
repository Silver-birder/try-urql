import { pipe, share, make, mergeMap, merge, tap } from "wonka";
import { print } from "graphql";

// @see: https://github.com/FormidableLabs/urql/issues/560
const executeFetch = (operation, opts) => {
  const { url, fetch: fetcher } = operation.context;
  let response;

  return (fetcher || fetch)(url, opts)
    .then((res) => {
      const { status } = res;
      const statusRangeEnd = opts.redirect === "manual" ? 400 : 300;
      response = res;

      if (status < 200 || status >= statusRangeEnd) {
        throw new Error(res.statusText);
      } else {
        return res.json();
      }
    })
    .then((result) => {
      // convert response data to ui logic data.
      return makeResult(operation, result, response);
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        return makeErrorResult(operation, err, response);
      }
    });
};

const createFetchSource = (operation) => {
  if (
    process.env.NODE_ENV !== "production" &&
    operation.operationName === "subscription"
  ) {
    throw new Error(
      `Received a subscription operation in the httpExchange.
        You are probably trying to create a subscription. Have you added a subscriptionExchange?`
    );
  }

  return make(({ next, complete }) => {
    const abortController =
      typeof AbortController !== "undefined"
        ? new AbortController()
        : undefined;

    const { context } = operation;

    const extraOptions =
      typeof context.fetchOptions === "function"
        ? context.fetchOptions()
        : context.fetchOptions || {};

    let ended = false;

    const fetchOptions = {
      method: "POST",
      headers: {},
      ...extraOptions,
      signal:
        abortController !== undefined ? abortController.signal : undefined,
    };
    const body = {
      query: print(operation.query),
      variables: operation.variables,
    };
    fetchOptions.body = JSON.stringify(body);
    fetchOptions.headers["content-type"] = "application/json";

    Promise.resolve()
      .then(() => (ended ? undefined : executeFetch(operation, fetchOptions)))
      .then((result) => {
        if (!ended) {
          ended = true;
          if (result) next(result);
          complete();
        }
      });
    return () => {
      ended = true;
      if (abortController !== undefined) {
        abortController.abort();
      }
    };
  });
};

const customExchange = ({ forward }) => {
  return (ops$) => {
    const sharedOps$ = share(ops$);
    const fetchResults$ = pipe(
      sharedOps$,
      mergeMap((operation) => {
        return pipe(
          createFetchSource(
            operation,
            operation.operationName === "query" &&
              !!operation.context.preferGetMethod
          )
        );
      })
    );
    const forward$ = pipe(sharedOps$, forward);
    return merge([fetchResults$, forward$]);
  };
};

const simpleExchange = ({ forward }) => {
  return (operations$) => {
    return forward(
      pipe(
        operations$,
        tap((op) => {
          console.log({ op });
        })
      )
    );
  };
};

export { simpleExchange, customExchange };
