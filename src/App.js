import React, { useCallback } from "react";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  useQuery,
  NetworkStatus,
  gql
} from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";

const client = new ApolloClient({
  uri: "https://gitlab.com/api/graphql",
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          projects: relayStylePagination()
        }
      }
    }
  })
});

const PROJECTS_QUERY = gql`
  query ProjectsQuery($after: String) {
    projects(first: 1, after: $after) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Reproduction />
    </ApolloProvider>
  );
}

function Reproduction() {
  const { data, loading, error, networkStatus, fetchMore } = useQuery(
    PROJECTS_QUERY,
    {
      notifyOnNetworkStatusChange: true
    }
  );

  const onLoadMore = useCallback(
    (after) => {
      fetchMore({
        query: PROJECTS_QUERY, // Comment this line and you will get the expected behaviour
        variables: { after }
      });
    },
    [fetchMore]
  );

  const fetchingMore = networkStatus === NetworkStatus.fetchMore;

  if (fetchingMore) return <div>Fetching more ...</div>;
  if (loading) return <div>Loading ...</div>;
  if (error) return <div>{JSON.stringify(error)}</div>;

  const projects = data.projects.edges.map((edge) => edge.node);
  const after = data.projects.pageInfo.endCursor;

  return (
    <div>
      <button type="button" onClick={() => onLoadMore(after)}>
        Fetch more
      </button>
      <ul>
        {projects.map((node) => (
          <li key={node.id}>{node.name}</li>
        ))}
      </ul>
    </div>
  );
}
