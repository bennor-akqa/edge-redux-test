import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { GraphQLError } from "graphql";
import { ClientError, GraphQLClient } from "graphql-request";

export interface GraphQLBaseQueryArgs {
  body: string;
  variables: Record<string, string>;
}

export default function graphqlRequestBaseQuery({
  baseUrl,
}: {
  baseUrl: string;
}): BaseQueryFn<GraphQLBaseQueryArgs> {
  return async ({ body, variables }) => {
    const client = new GraphQLClient(baseUrl, {
      fetch,
      credentials: "include",
      errorPolicy: "all",
    });

    let errors: GraphQLError[] | undefined = undefined;

    try {
      const { data, errors: err } = await client.rawRequest(body, variables);

      if (!err) return { data: data };

      errors = err;
    } catch (err) {
      if (typeof err === "object") {
        errors =
          ((JSON.parse(JSON.stringify(err)) as ClientError)?.response
            ?.errors as GraphQLError[]) ?? [];
      }
    } finally {
    }
    return { error: errors };
  };
}
